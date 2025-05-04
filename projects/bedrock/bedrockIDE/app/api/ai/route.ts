import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import Ollama from "ollama"

// Simple in-memory vector store for our basic retrieval system
const knowledgeBase = [
  {
    id: "solidity-basics",
    text: "Solidity is an object-oriented programming language for implementing smart contracts on various blockchain platforms, most notably, Ethereum. It was developed by Christian Reitwiessner, Alex Beregszaszi, and several former Ethereum core contributors. Programs in Solidity run on Ethereum Virtual Machine.",
    metadata: { source: "documentation", category: "solidity" },
  },
  {
    id: "rust-blockchain",
    text: "Rust is increasingly being used for blockchain development due to its safety guarantees and performance. It's the primary language for Substrate, a framework for building custom blockchains, and is used in projects like Solana and Near Protocol.",
    metadata: { source: "documentation", category: "rust" },
  },
  {
    id: "hardhat-framework",
    text: "Hardhat is a development environment for Ethereum software. It consists of different components for editing, compiling, debugging and deploying your smart contracts and dApps, all of which work together to create a complete development environment.",
    metadata: { source: "documentation", category: "hardhat" },
  },
  {
    id: "vyper-language",
    text: "Vyper is a contract-oriented, pythonic programming language that targets the Ethereum Virtual Machine (EVM). It aims to provide superior audit ability by making it easier for developers to produce code that is both human-readable and computationally efficient.",
    metadata: { source: "documentation", category: "vyper" },
  },
]

// Initialize Ollama client
const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://localhost:11434' })

// Simple search function for our retrieval system
function searchKnowledgeBase(query: string, limit: number = 3) {
  // This is a very basic search implementation
  // In a real app, you'd use proper embeddings and vector similarity
  return knowledgeBase
    .map(doc => {
      const score = calculateRelevance(query, doc.text)
      return { ...doc, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

// Very basic relevance calculation
function calculateRelevance(query: string, text: string): number {
  const queryTerms = query.toLowerCase().split(/\s+/)
  const textLower = text.toLowerCase()
  
  // Count how many query terms are in the text
  let matchCount = 0
  for (const term of queryTerms) {
    if (term.length > 3 && textLower.includes(term)) {
      matchCount++
    }
  }
  
  return matchCount / queryTerms.length
}

export async function POST(req: NextRequest) {
  try {
    const { code, language, prompt } = await req.json()

    // Retrieve relevant context from the knowledge base
    const relevantDocs = searchKnowledgeBase(prompt)
    const context = relevantDocs.map((doc) => doc.text).join("\n\n")

    // Construct the full prompt with context
    const fullPrompt = `
You are an AI assistant specialized in blockchain development.

Context information:
${context}

Current language: ${language}
Current code:
\`\`\`${language}
${code}
\`\`\`

User request: ${prompt}

Provide a helpful, concise response with code examples if relevant.
`

    // Generate response using Ollama
    const response = await ollama.generate({
      model: "codellama",
      prompt: fullPrompt,
      temperature: 0.7,
      options: {
        num_predict: 1000,
      }
    })

    return NextResponse.json({ response: response.response })
  } catch (error) {
    console.error("AI API error:", error)
    return NextResponse.json({ error: "Failed to process AI request" }, { status: 500 })
  }
}
