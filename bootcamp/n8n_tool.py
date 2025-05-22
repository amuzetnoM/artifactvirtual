# Example n8n Tool Wrapper
import requests

class N8NTool:
    def __init__(self, base_url, api_key=None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key

    def trigger_workflow(self, workflow_id, data=None):
        url = f"{self.base_url}/webhook/{workflow_id}"
        headers = {}
        if self.api_key:
            headers['Authorization'] = f"Bearer {self.api_key}"
        try:
            response = requests.post(url, json=data or {}, headers=headers)
            return {
                'status_code': response.status_code,
                'response': response.json() if response.headers.get('content-type') == 'application/json' else response.text
            }
        except Exception as e:
            return {'error': str(e)}
