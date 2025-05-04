import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
  features = [
    {
      title: 'Smart Contract Development',
      description: 'Create, edit, and test Solidity smart contracts with syntax highlighting and error checking.',
      icon: 'code'
    },
    {
      title: 'AI-Powered Assistance',
      description: 'Get intelligent code suggestions, contract security analysis, and best practices recommendations.',
      icon: 'smart_toy'
    },
    {
      title: 'Built-in Compiler',
      description: 'Compile your contracts directly in the browser with immediate feedback and optimization options.',
      icon: 'build'
    },
    {
      title: 'Blockchain Integration',
      description: 'Deploy contracts to testnets and mainnets with built-in wallet connectivity and gas estimations.',
      icon: 'link'
    },
    {
      title: 'Security Analysis',
      description: 'Automatically scan your code for vulnerabilities and get recommendations for secure coding.',
      icon: 'security'
    },
    {
      title: 'Multi-Chain Support',
      description: 'Deploy to multiple blockchain networks including Ethereum, Polygon, Binance Smart Chain and more.',
      icon: 'device_hub'
    }
  ];

  constructor(private router: Router) {}

  navigateToEditor(): void {
    this.router.navigate(['/editor']);
  }
}