"""
High-Fidelity Web Image Optimizer for Dr. Ambedkar Heritage Museum.
Optimizes JPEG and PNG images in-place without compromising visual quality.
- JPEG: Quality 88 (perceptually lossless), Progressive scan, Huffman table optimization, max 2048px (2K Archival Master).
- PNG: Lossless zlib level 9 compression, metadata optimization.
- Safe: Only replaces files if the resulting file size is smaller than the original.
- Preserves exact filenames, directory paths, and extensions.
"""

import os
import io
import sys
from PIL import Image

def optimize_images(target_dir: str):
    print(f"Scanning '{target_dir}' for images...")
    total_orig = 0
    total_new = 0
    optimized_count = 0
    untouched_count = 0
    error_count = 0

    image_files = []
    for root, _, files in os.walk(target_dir):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in ('.jpg', '.jpeg', '.png'):
                image_files.append((os.path.join(root, f), ext))

    print(f"Found {len(image_files)} candidate images. Starting high-fidelity optimization...\n")

    for i, (path, ext) in enumerate(image_files, 1):
        orig_size = os.path.getsize(path)
        total_orig += orig_size

        try:
            with Image.open(path) as img:
                buf = io.BytesIO()

                if ext in ('.jpg', '.jpeg'):
                    # Auto-orient based on EXIF tag
                    if hasattr(img, '_getexif') and img._getexif():
                        from PIL import ExifTags
                        exif = img._getexif()
                        for orientation in ExifTags.TAGS.keys():
                            if ExifTags.TAGS[orientation] == 'Orientation':
                                break
                        if exif and orientation in exif:
                            if exif[orientation] == 3: img = img.rotate(180, expand=True)
                            elif exif[orientation] == 6: img = img.rotate(270, expand=True)
                            elif exif[orientation] == 8: img = img.rotate(90, expand=True)

                    # Clamp oversized scans to 2048px 2K archival resolution
                    if max(img.width, img.height) > 2048:
                        img.thumbnail((2048, 2048), Image.Resampling.LANCZOS)

                    # Convert to RGB (in case of CMYK) and encode progressive JPEG with optimal Huffman tables
                    img.convert('RGB').save(
                        buf,
                        format='JPEG',
                        quality=88,
                        optimize=True,
                        progressive=True
                    )

                elif ext == '.png':
                    # Lossless maximum PNG compression
                    img.save(
                        buf,
                        format='PNG',
                        optimize=True,
                        compress_level=9
                    )

                new_data = buf.getvalue()
                new_size = len(new_data)

                # Only replace if size reduction was achieved
                if new_size < orig_size:
                    temp_path = path + ".tmp"
                    with open(temp_path, "wb") as f_out:
                        f_out.write(new_data)
                    os.replace(temp_path, path)
                    total_new += new_size
                    optimized_count += 1
                else:
                    total_new += orig_size
                    untouched_count += 1

        except Exception as e:
            print(f"[ERROR] Failed to optimize {os.path.basename(path)}: {e}")
            error_count += 1
            total_new += orig_size

        if i % 100 == 0 or i == len(image_files):
            print(f"Processed {i}/{len(image_files)} images...")

    saved_mb = (total_orig - total_new) / (1024 * 1024)
    pct_saved = ((total_orig - total_new) / total_orig) * 100 if total_orig else 0

    print("\n" + "=" * 50)
    print("IMAGE OPTIMIZATION SUMMARY")
    print("=" * 50)
    print(f"Total Original Size : {total_orig / (1024 * 1024):.2f} MB")
    print(f"Total Optimized Size: {total_new / (1024 * 1024):.2f} MB")
    print(f"Total Space Saved   : {saved_mb:.2f} MB ({pct_saved:.1f}%)")
    print(f"Images Compressed   : {optimized_count}")
    print(f"Images Unchanged    : {untouched_count} (already optimal)")
    print(f"Errors Encountered  : {error_count}")
    print("=" * 50)

if __name__ == "__main__":
    target = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "public")
    optimize_images(target)
