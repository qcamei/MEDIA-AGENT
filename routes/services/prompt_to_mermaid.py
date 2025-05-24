import re



flow_keywords = {
            '开始': 'start',
            '结束': 'end',
            '然后': '-->',
            '如果': 'if{',
            '否则': 'else{',
            '循环': 'loop{'
}

def translate_flow(prompt):
    # 基础清洗
    clean_prompt = re.sub(r'[^\w\u4e00-\u9fa5，。]', '', prompt)

    # 关键词替换
    for cn, en in flow_keywords.items():
        clean_prompt = clean_prompt.replace(cn, en)

    # 生成Mermaid代码
    lines = clean_prompt.replace('，', '\n    ')
    mermaid_code = f"flowchart TD\n    {lines}"
    return mermaid_code

def translate_class(self, prompt):
    # 类图转换逻辑
    return f"""classDiagram\n    {prompt}"""


if __name__ == "__main__":

    user_input = input("请输入流程图描述：")
    print("生成的Mermaid代码：")
    print(translate_flow(user_input))
