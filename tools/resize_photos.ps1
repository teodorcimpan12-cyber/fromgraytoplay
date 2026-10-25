# Resizes field-visit photos for the web: field-raw\*.jpg -> img\sibiu\field\*.jpg
# Longest side <= 1200 px, JPEG quality lowered until <= 300 KB. Re-encoding drops all EXIF
# (including GPS), so the public copies carry no metadata; the originals in field-raw\ keep it.
# Usage (from the repo root): powershell -ExecutionPolicy Bypass -File tools\resize_photos.ps1
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root "field-raw"
$dst = Join-Path $root "img\sibiu\field"
if (-not (Test-Path $src)) { Write-Error "Put the original photos in $src first."; exit 1 }
New-Item -ItemType Directory -Force $dst | Out-Null
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }

foreach ($f in Get-ChildItem $src -File | Where-Object { $_.Extension -match '^\.jpe?g$' }) {
  $img = [System.Drawing.Image]::FromFile($f.FullName)
  try {
    # Respect the camera's orientation tag (0x0112) before it is dropped.
    if ($img.PropertyIdList -contains 0x0112) {
      switch ($img.GetPropertyItem(0x0112).Value[0]) {
        3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
        6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
        8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
      }
    }
    $scale = [Math]::Min([double]1, 1200.0 / [Math]::Max($img.Width, $img.Height))
    $w = [int]($img.Width * $scale); $h = [int]($img.Height * $scale)
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $w, $h); $g.Dispose()
    $out = Join-Path $dst ($f.BaseName.ToLower() + ".jpg")
    foreach ($q in 82, 72, 62, 52, 42) {
      $p = New-Object System.Drawing.Imaging.EncoderParameters 1
      $p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]$q)
      $bmp.Save($out, $codec, $p)
      if ((Get-Item $out).Length -le 300KB) { break }
    }
    $bmp.Dispose()
    "{0} -> {1} ({2} KB)" -f $f.Name, (Split-Path $out -Leaf), [int]((Get-Item $out).Length / 1KB)
  } finally { $img.Dispose() }
}
