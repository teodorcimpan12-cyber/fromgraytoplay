# Composes one satellite timeline strip per court from tools/sat_strips.mjs's plan (Windows .NET drawing).
# Called by sat_strips.mjs; output PNGs go to the folder that holds plan.json.
param([string]$Dir)
Add-Type -AssemblyName System.Drawing
$plan = Get-Content (Join-Path $Dir "plan.json") -Raw -Encoding UTF8 | ConvertFrom-Json
# PowerShell variable names are case-insensitive: keep $FrameSize distinct from any $framesize-like name.
$FrameSize = [int]$plan.size; $LabelH = 24
foreach ($court in $plan.courts) {
  $n = $court.frames.Count
  if ($n -eq 0) { continue }
  $bmp = [System.Drawing.Bitmap]::new([int]($FrameSize * $n), [int]($FrameSize + $LabelH))
  $gr = [System.Drawing.Graphics]::FromImage($bmp)
  $gr.Clear([System.Drawing.Color]::FromArgb(15, 18, 32))
  $gr.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $font = [System.Drawing.Font]::new("Consolas", 12, [System.Drawing.FontStyle]::Bold)
  $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 214, 10), 2)
  $pen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
  $i = 0
  foreach ($fr in $court.frames) {
    $ox = $i * $FrameSize
    $gr.SetClip([System.Drawing.Rectangle]::new([int]$ox, 0, $FrameSize, $FrameSize))
    foreach ($t in $fr.tiles) {
      if (-not $t.file) { continue }
      $im = [System.Drawing.Image]::FromFile($t.file)
      $s = [double]$fr.scale
      $gr.DrawImage($im, [float]($ox + $t.dx * $s), [float]($t.dy * $s), [float](256 * $s), [float](256 * $s))
      $im.Dispose()
    }
    if ($fr.outline.Count -gt 2) {
      $pts = $fr.outline | ForEach-Object { [System.Drawing.PointF]::new([float]($ox + $_[0]), [float]$_[1]) }
      $gr.DrawPolygon($pen, [System.Drawing.PointF[]]$pts)
    }
    $gr.ResetClip()
    $gr.DrawString(("{0}  {1}" -f ($i + 1), $fr.date), $font, [System.Drawing.Brushes]::White, [float]($ox + 6), [float]($FrameSize + 3))
    $i++
  }
  $file = Join-Path $Dir ($court.id + ".png")
  $bmp.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
  $gr.Dispose(); $bmp.Dispose()
  $file
}
