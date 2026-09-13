#!/usr/bin/env python3
"""Generuje mały watermark z ikonką Twitcha + nickiem (np. 'Pysiex_') jako PNG
z przezroczystym tłem, do nałożenia na klip przez overlay w ffmpeg.

Rysowany od zera (nie kopia przesłanego loga) - to własny kanał użytkownika,
więc uproszczone odwzorowanie brandu jest OK do自 promocji, ale nie jest
pikselowo identyczne z oficjalnym logo Twitcha.
"""
import argparse
from PIL import Image, ImageDraw, ImageFont

FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
TWITCH_PURPLE = (145, 70, 255, 255)


def build_badge(nick: str, scale: int = 4) -> Image.Image:
    h = 90 * scale
    icon_size = h
    pad = 14 * scale
    font = ImageFont.truetype(FONT_PATH, 42 * scale)

    tmp = Image.new("RGBA", (10, 10))
    draw = ImageDraw.Draw(tmp)
    text_bbox = draw.textbbox((0, 0), nick, font=font)
    text_w = text_bbox[2] - text_bbox[0]

    width = icon_size + pad + text_w + pad * 2
    img = Image.new("RGBA", (width, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    radius = 18 * scale
    draw.rounded_rectangle([0, 0, width - 1, h - 1], radius=radius, fill=TWITCH_PURPLE)

    # Ikona: czarny zaokrąglony kwadrat z białym glifem Twitcha (dymek czatu
    # z dwoma pionowymi paskami) w środku - odwzorowanie referencyjnej plakietki.
    icon_pad = 16 * scale
    bx0, by0 = icon_pad, icon_pad
    bx1, by1 = icon_size - icon_pad, h - icon_pad - 6 * scale
    draw.rounded_rectangle([bx0, by0, bx1, by1], radius=8 * scale, fill=(0, 0, 0, 255))
    bar_w = 5 * scale
    bar_h = (by1 - by0) * 0.42
    bar_y0 = by0 + (by1 - by0) * 0.29
    cx = (bx0 + bx1) / 2
    draw.rectangle([cx - bar_w * 1.8, bar_y0, cx - bar_w * 0.6, bar_y0 + bar_h], fill=(255, 255, 255, 255))
    draw.rectangle([cx + bar_w * 0.6, bar_y0, cx + bar_w * 1.8, bar_y0 + bar_h], fill=(255, 255, 255, 255))

    text_x = icon_size + pad
    text_y = (h - (text_bbox[3] - text_bbox[1])) / 2 - text_bbox[1]
    draw.text((text_x, text_y), nick, font=font, fill=(255, 255, 255, 255))

    return img.resize((width // scale, h // scale), Image.LANCZOS)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--nick", default="Pysiex_")
    parser.add_argument("--output", default="presets/twitch_badge.png")
    args = parser.parse_args()
    badge = build_badge(args.nick)
    badge.save(args.output)
    print(f"Zapisano: {args.output} ({badge.size[0]}x{badge.size[1]})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
