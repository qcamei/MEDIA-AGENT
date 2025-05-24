# 安装Pillow库
#pip install Pillow

# 生成占位图的代码 (save as generate_placeholder.py)
from PIL import Image, ImageDraw, ImageFont


def create_placeholder(width=800, height=600, text="Placeholder Image"):
    # 创建白色背景
    image = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(image)

    # 设置字体
    font = ImageFont.load_default()

    # 计算文本位置
    text_width, text_height = draw.textsize(text, font=font)
    x = (width - text_width) // 2
    y = (height - text_height) // 2

    # 绘制文本
    draw.text((x, y), text, fill='gray', font=font)

    # 保存为PNG
    image.save('../../frontend/static/images/placeholder.png')
    print("占位图已生成：placeholder.png")


if __name__ == "__main__":
    create_placeholder()