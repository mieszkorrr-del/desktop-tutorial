#!/usr/bin/env python3
"""Generuje plakietkę z obramowaniem i pogrubionym tekstem, w stylu memowych
podpisów (np. Fame MMA: biały box/czarny tekst, albo odwrotnie: czarny
box/biały tekst) - PNG z przezroczystym tłem, do nałożenia na wideo przez
overlay w ffmpeg."""
import argparse
from PIL import Image, ImageDraw, ImageFont

FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def parse_color(s: str) -> tuple[int, int, int, int]:
    if s == "white":
        return (255, 255, 255, 255)
    if s == "black":
        return (0, 0, 0, 255)
    return tuple(int(v) for v in s.split(",")) + (255,)


def build_caption(
    text: str, box_w: int, box_h: int, scale: int = 4,
    bg_color=(255, 255, 255, 255), text_color=(0, 0, 0, 255), border_color=(0, 0, 0, 255),
) -> Image.Image:
    W, H = box_w * scale, box_h * scale
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    border = 5 * scale
    radius = 10 * scale
    draw.rounded_rectangle([0, 0, W - 1, H - 1], radius=radius, fill=border_color)
    draw.rounded_rectangle(
        [border, border, W - 1 - border, H - 1 - border],
        radius=max(radius - border, 0), fill=bg_color,
    )

    lines = text.split("\n") if "\n" in text else [text]
    font_size = 40 * scale
    font = ImageFont.truetype(FONT_PATH, font_size)

    def line_sizes(lines, font):
        sizes = []
        for ln in lines:
            b = draw.textbbox((0, 0), ln, font=font)
            sizes.append((b[2] - b[0], b[3] - b[1]))
        return sizes

    pad = 20 * scale
    while True:
        sizes = line_sizes(lines, font)
        max_w = max(w for w, h in sizes)
        total_h = sum(h for w, h in sizes) + (len(lines) - 1) * 8 * scale
        if max_w <= W - pad * 2 and total_h <= H - pad * 2 or font_size <= 10:
            break
        font_size -= 2 * scale
        font = ImageFont.truetype(FONT_PATH, font_size)

    sizes = line_sizes(lines, font)
    total_h = sum(h for w, h in sizes) + (len(lines) - 1) * 8 * scale
    y = (H - total_h) / 2
    for ln, (lw, lh) in zip(lines, sizes):
        b = draw.textbbox((0, 0), ln, font=font)
        x = (W - lw) / 2 - b[0]
        draw.text((x, y - b[1]), ln, font=font, fill=text_color)
        y += lh + 8 * scale

    return img.resize((box_w, box_h), Image.LANCZOS)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--text", required=True, help="tekst, użyj \\n dla podziału na linie")
    parser.add_argument("--width", type=int, default=245)
    parser.add_argument("--height", type=int, default=103)
    parser.add_argument("--bg", default="white", help="'white', 'black', albo 'R,G,B'")
    parser.add_argument("--fg", default="black", help="kolor tekstu: 'white', 'black', albo 'R,G,B'")
    parser.add_argument("--border", default=None, help="kolor obramowania (domyślnie taki jak --fg)")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    text = args.text.replace("\\n", "\n")
    bg = parse_color(args.bg)
    fg = parse_color(args.fg)
    border = parse_color(args.border) if args.border else fg
    img = build_caption(text, args.width, args.height, bg_color=bg, text_color=fg, border_color=border)
    img.save(args.output)
    print(f"Zapisano: {args.output} ({img.size[0]}x{img.size[1]})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
