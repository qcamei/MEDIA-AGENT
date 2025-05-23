from venv import logger
import requests
import base64
from io import BytesIO
from PIL import Image, ImageDraw
#from cairosvg import svg2png

class MermaidGenerator:
    def generate_image(self, mermaid_code):
        try:
            # 调用Mermaid在线服务生成SVG
            response = requests.post(
                "https://mermaid.ink/svg",
                data=mermaid_code,
                headers={"Content-Type": "text/plain"}
            )

            if response.status_code == 200:
                # 转换SVG为PNG格式

                png_data ="../../frontend/static/images/placeholder.png"#= svg2png(bytestring=response.content)

                # 返回Base64编码图像
                return base64.b64encode(png_data).decode('utf-8')
            else:
                raise Exception(f"Mermaid服务错误: {response.status_code}")

        except Exception as e:
            # 生成简易占位图
            logger.warning(f"使用备用图表生成: {str(e)}")
            return self._create_mock_image(mermaid_code)

    def _create_mock_image(self, text):
        # 创建带有文字说明的占位图
        img = Image.new('RGB', (512, 512), color=(240, 240, 240))
        draw = ImageDraw.Draw(img)
        draw.text((50, 200), f"Mermaid图表生成失败\n原代码:{text[:100]}", fill="black")

        buffered = BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode('utf-8')
