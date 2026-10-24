"""
Генерация лёгких WebP-версий картинок для сайта.

Запуск:  python scripts/optimize-images.py [--force]
         (или npm run images)

Структура:
  masters/  — исходники (PNG/JPG, в деплой не попадают)
  public/   — только готовые .webp, которые отдаются сайтом

Что делает:
  masters/arts/*.png            -> public/arts/*.webp (2000 px)
                                -> public/arts/thumbs/*.webp (640 px)
  masters/commgallery/<cat>/*.png -> public/commgallery/<cat>/*.webp
                                -> public/commgallery/<cat>/thumbs/*.webp
  masters/commishionsart/*.png  -> public/commishionsart/*.webp
                                -> public/commishionsart/thumbs/*.webp
  masters/cover.jpg             -> public/cover.webp (1600 px)
  masters/ava.jpg               -> public/ava.webp (512 px)

Добавить новую работу: положить PNG в masters/... и запустить скрипт.
Повторный запуск пропускает файлы, которые уже новее исходника (если не указан --force).
"""

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MASTERS = ROOT / "masters"
PUBLIC = ROOT / "public"

FORCE = "--force" in sys.argv

THUMB_WIDTH = 640
FULL_WIDTH = 2000
COVER_WIDTH = 1600
AVATAR_SIZE = 512

THUMB_QUALITY = 78
FULL_QUALITY = 82
COVER_QUALITY = 80
AVATAR_QUALITY = 82


def convert(src: Path, dst: Path, max_width: int, quality: int):
    dst.parent.mkdir(parents=True, exist_ok=True)

    if dst.exists() and not FORCE and dst.stat().st_mtime >= src.stat().st_mtime:
        return None

    with Image.open(src) as img:
        img = img.convert("RGBA" if img.mode in ("RGBA", "LA", "P") else "RGB")

        if img.width > max_width:
            height = round(img.height * max_width / img.width)
            img = img.resize((max_width, height), Image.LANCZOS)

        img.save(dst, "WEBP", quality=quality, method=6)

    return src.stat().st_size, dst.stat().st_size


def add_pair(jobs, src: Path, full_dir: Path, thumb_dir: Path):
    """Полная версия + превью из одного исходника."""
    jobs.append((src, full_dir / f"{src.stem}.webp", FULL_WIDTH, FULL_QUALITY))
    jobs.append((src, thumb_dir / f"{src.stem}.webp", THUMB_WIDTH, THUMB_QUALITY))


def collect_jobs():
    jobs = []

    for src in sorted((MASTERS / "arts").glob("*.png")):
        add_pair(jobs, src, PUBLIC / "arts", PUBLIC / "arts" / "thumbs")

    for src in sorted((MASTERS / "commgallery").glob("*/*.png")):
        category = src.parent.name
        add_pair(
            jobs,
            src,
            PUBLIC / "commgallery" / category,
            PUBLIC / "commgallery" / category / "thumbs",
        )

    for src in sorted((MASTERS / "commishionsart").glob("*.png")):
        add_pair(jobs, src, PUBLIC / "commishionsart", PUBLIC / "commishionsart" / "thumbs")

    cover = MASTERS / "cover.jpg"
    if cover.exists():
        jobs.append((cover, PUBLIC / "cover.webp", COVER_WIDTH, COVER_QUALITY))

    avatar = MASTERS / "ava.jpg"
    if avatar.exists():
        jobs.append((avatar, PUBLIC / "ava.webp", AVATAR_SIZE, AVATAR_QUALITY))

    return jobs


def run():
    if not MASTERS.exists():
        print(f"Не найдена папка исходников: {MASTERS}")
        sys.exit(1)

    jobs = collect_jobs()
    if not jobs:
        print("В masters/ нет исходников — нечего генерировать.")
        return

    total_before = 0
    total_after = 0
    counted_sources = set()
    done = 0

    for src, dst, width, quality in jobs:
        result = convert(src, dst, width, quality)
        if result is None:
            continue

        before, after = result
        if src not in counted_sources:
            counted_sources.add(src)
            total_before += before
        total_after += after
        done += 1
        print(
            f"{src.relative_to(MASTERS)!s:<48} "
            f"{before / 1024:8.0f} KB -> {after / 1024:6.0f} KB  "
            f"{dst.relative_to(PUBLIC)}"
        )

    if done == 0:
        print("Нечего обновлять (все .webp уже свежие). Используйте --force.")
        return

    print(
        f"\nГотово: {done} файлов, "
        f"{total_before / 1024 / 1024:.1f} MB -> {total_after / 1024 / 1024:.1f} MB"
    )


if __name__ == "__main__":
    run()
