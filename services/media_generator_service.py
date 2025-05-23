import base64
import random
from io import BytesIO
import deepseek
from PIL import Image
from backend.utils.mermaid_generator import MermaidGenerator
from backend.utils.prompt_to_mermaid import MermaidTranslator

mermaid_translator = MermaidTranslator()
mermaid_generator = MermaidGenerator()
class MediaGeneratorService:
    def __init__(self, config):
        self.config = config
        deepseek.api_key = config.get('DEEPSEEK_API_KEY')

    def generate(self, prompt, media_type):
        if media_type == 'image':
            return self.generate_image(prompt)
        elif media_type == '3d':
            return self.generate_3d_model(prompt)
        elif media_type == 'word':
            return self.generate_word_document(prompt)
        elif media_type == 'ppt':
            return self.generate_ppt(prompt)
        else:
            raise ValueError(f"Unsupported media type: {media_type}")

    def generate_image(self, prompt):
        mermaid_code = mermaid_translator.translate_flow(prompt)
        return mermaid_generator.generate_image(mermaid_code)

    # def generate_image(self, prompt):
    #     try:
    #         # 调用 OpenAI DALL-E API
    #         response = openai.Image.create(
    #             prompt=prompt,
    #             n=1,
    #             size="512x512",
    #             response_format="b64_json"
    #         )
    #
    #         # 返回 Base64 编码的图像
    #         return response['data'][0]['b64_json']
    #     except Exception as e:
    #         # 在没有API密钥的情况下，生成随机占位图
    #         app.logger.warning(f"Using mock image generation: {str(e)}")
    #         return self._create_mock_image()

    def generate_3d_model(self, prompt):
        # 模拟3D模型生成
        return self._create_mock_3d_model()

    def generate_word_document(self, prompt):
        # 模拟Word文档生成
        return self._create_mock_document()

    def generate_ppt(self, prompt):
        # 模拟PPT生成
        return self._create_mock_ppt()

    def _create_mock_image(self):
        # 创建一个简单的彩色图像作为占位符
        img = Image.new('RGB', (512, 512),
                        color=(random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)))

        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()

        return img_str

    def _create_mock_3d_model(self):
        # 返回一个简单的3D模型（Wavefront OBJ格式）
        mock_model = """# Simple cube model
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 1.0 1.0 0.0
v 0.0 1.0 0.0
v 0.0 0.0 1.0
v 1.0 0.0 1.0
v 1.0 1.0 1.0
v 0.0 1.0 1.0
f 1 2 3 4
f 5 6 7 8
f 1 5 8 4
f 2 6 7 3
f 1 2 6 5
f 4 3 7 8"""

        return base64.b64encode(mock_model.encode()).decode()

    def _create_mock_document(self):
        # 返回一个简单的Word文档（模拟为文本）
        mock_content = f"""# {prompt}

这是一个由AI生成的文档示例。

## 引言
{prompt} 是一个很有趣的主题，在本文中我们将探讨相关内容。

## 主要内容
1. 第一点内容
2. 第二点内容
3. 第三点内容

## 结论
通过本文的讨论，我们可以得出以下结论..."""

        return base64.b64encode(mock_content.encode()).decode()

    def _create_mock_ppt(self):
        # 返回一个简单的PPT文档（模拟为文本）
        mock_ppt = f"""幻灯片1: 标题页
- 标题: {prompt}
- 副标题: 由AI生成的演示文稿

幻灯片2: 目录
- 引言
- 主要内容
- 案例分析
- 结论

幻灯片3: 引言
- {prompt} 的背景介绍
- 重要性和意义

幻灯片4: 主要内容1
- 第一点详细内容...

幻灯片5: 主要内容2
- 第二点详细内容...

幻灯片6: 案例分析
- 实际案例展示

幻灯片7: 结论
- 总结和未来展望"""

        return base64.b64encode(mock_ppt.encode()).decode()