---
tags: [helper, firebase]
symbol: useFirebase
line: 171
---

# useFirebase

`function useFirebase(path)` — `index.html:171`. The read primitive.

```js
function useFirebase(path) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!path) return;
    const ref = db.ref(path);
    const fn = snap => setData(snap.val());
    ref.on('value', fn);
    return () => ref.off('value', fn);   // cleanup — avoids listener leaks
  }, [path]);
  return data;
}
```

## Usage

```js
const votes   = useFirebase("votes");          // object | null
const courts  = useFirebase("courts");
const checkins = useFirebase("courts/" + id + "/checkins");
```

Returns `null` until first snapshot. Always null-guard.

## Notes

- Cleanup (`ref.off`) is built in — this is why you should prefer it over
  ad-hoc `db.ref().on()` calls (which leak if you forget to detach).
- For **writes**, use `db.ref(path).push/set/transaction` directly; this
  hook is read-only. See [[Firebase Schema#Write conventions]].
