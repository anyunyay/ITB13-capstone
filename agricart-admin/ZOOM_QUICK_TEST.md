# 🚀 Quick Zoom Test - 2 Minutes

## Step 1: Add Test Component (30 seconds)

Open any page file (e.g., `resources/js/pages/Customer/Home/index.tsx`) and add:

```tsx
import { ResponsiveZoomTester } from '@/components/debug/ResponsiveZoomTester';

export default function YourPage() {
  return (
    <>
      <ResponsiveZoomTester />
      {/* Your existing content */}
    </>
  );
}
```

## Step 2: Start Dev Server (if not running)

```bash
npm run dev
```

## Step 3: Test Zoom Levels (1 minute)

Open your browser and:

1. **Reset to 100%**: Press `Ctrl + 0` (Windows) or `Cmd + 0` (Mac)
2. **Zoom to 90%**: Press `Ctrl + -` once
3. **Zoom to 110%**: Press `Ctrl + +` twice
4. **Zoom to 125%**: Press `Ctrl + +` three more times
5. **Zoom to 150%**: Press `Ctrl + +` three more times

## What to Check ✅

At each zoom level:
- [ ] No horizontal scrolling
- [ ] Layout looks good
- [ ] Text is readable
- [ ] Zoom tester shows correct percentage
- [ ] Zoom tester badge color changes

## Expected Results

| Zoom Level | Badge Color | Status |
|------------|-------------|--------|
| 90% | Yellow | ✅ Working |
| 100% | Gray | ✅ Working |
| 110% | Green | ✅ Working |
| 125% | Blue | ✅ Working |
| 150% | Purple | ✅ Working |

## Done! 🎉

If all checks pass, your website is fully responsive at all zoom levels!

**Remove the `<ResponsiveZoomTester />` component before deploying to production.**

---

## Troubleshooting

**Tester not showing?**
- Check the import path is correct
- Make sure you saved the file
- Refresh the browser (Ctrl + R)

**Zoom not detected?**
- Try pressing Ctrl + 0 first to reset
- Check browser console for errors
- Make sure ScaleProvider is in app.tsx

**Layout breaks?**
- Check for fixed-width elements (w-[500px])
- Use responsive classes instead (w-full max-w-2xl)
- See RESPONSIVE_ZOOM_COMPLETE_GUIDE.md for details
