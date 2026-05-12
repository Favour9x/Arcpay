import re

files = [
    'src/components/SwapTab.tsx',
    'src/components/BridgeTab.tsx',
    'src/components/UnifiedTab.tsx'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the first occurrence of "return ("
    first_return = content.find('\n  return (')
    if first_return == -1:
        print(f"No return statement found in {filepath}")
        continue
    
    # Find the matching closing brace and semicolon for the first return
    # Count braces to find the end of the component
    brace_count = 0
    in_return = False
    end_pos = first_return
    
    for i in range(first_return, len(content)):
        char = content[i]
        if char == '(' and not in_return:
            in_return = True
            brace_count = 1
        elif in_return:
            if char == '(':
                brace_count += 1
            elif char == ')':
                brace_count -= 1
                if brace_count == 0:
                    # Found the end of return statement
                    # Now find the closing brace of the function
                    for j in range(i, len(content)):
                        if content[j:j+2] == '\n}':
                            end_pos = j + 2
                            break
                    break
    
    if end_pos > first_return:
        # Keep only up to the first complete component
        fixed_content = content[:end_pos] + '\n'
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        print(f"Fixed {filepath}")
    else:
        print(f"Could not fix {filepath}")
