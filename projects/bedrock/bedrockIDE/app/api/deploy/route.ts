import { type NextRequest, NextResponse } from "next/server"
import { deployContract } from "@/lib/blockchain-utils"

export async function POST(req: NextRequest) {
  try {
    const { abi, bytecode, network, constructorArgs = [], privateKey } = await req.json()

    // Validate required parameters
    if (!abi || !bytecode || !network) {
      return NextResponse.json(
        { error: "Missing required parameters", success: false },
        { status: 400 }
      )
    }

    // Deploy the contract using blockchain-utils
    const result = await deployContract(
      abi,
      bytecode,
      network,
      privateKey,
      constructorArgs
    )

    return NextResponse.json({
      success: true,
      contractAddress: result.address,
      transactionHash: result.transactionHash,
      gasUsed: result.gasUsed,
      network,
    })
  } catch (error) {
    console.error("Deployment error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to deploy contract", success: false },
      { status: 500 }
    )
  }
}
