# Example CLI Tool Wrapper
import subprocess
import os
import re

class CLITool:
    def __init__(self, name):
        self.name = name

    def execute(self, command):
        # Detect and handle file redirection (>) natively for cross-platform support
        redir_match = re.match(r"(.+?)\s*>\s*(\S+)", command)
        if redir_match:
            cmd_part = redir_match.group(1).strip()
            file_part = redir_match.group(2).strip()
            # Try to extract echo or similar content
            echo_match = re.match(r"echo\s+['\"]?(.*)['\"]?$", cmd_part, re.I)
            if echo_match:
                content = echo_match.group(1)
                # Write to file using Python for robustness
                try:
                    with open(file_part, 'w', encoding='utf-8') as f:
                        f.write(content + '\n')
                    return {'stdout': f'File {file_part} written.', 'stderr': '', 'returncode': 0}
                except Exception as e:
                    return {'stdout': '', 'stderr': str(e), 'returncode': 1}
            # If not echo, fallback to PowerShell Set-Content for Windows
            if os.name == 'nt':
                ps_command = f"{cmd_part} | Set-Content {file_part}"
                try:
                    import subprocess
                    result = subprocess.run(["powershell", "-Command", ps_command], capture_output=True, text=True)
                    return {
                        'stdout': result.stdout,
                        'stderr': result.stderr,
                        'returncode': result.returncode
                    }
                except Exception as e:
                    return {'stdout': '', 'stderr': str(e), 'returncode': 1}
        # Default: run as normal shell command
        try:
            import subprocess
            result = subprocess.run(command, shell=True, capture_output=True, text=True)
            return {
                'stdout': result.stdout,
                'stderr': result.stderr,
                'returncode': result.returncode
            }
        except Exception as e:
            return {'error': str(e)}
