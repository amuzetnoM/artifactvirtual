"use client"

import { useState, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, useGLTF, PresentationControls } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Download, Rotate3D, ZoomIn, ZoomOut } from "lucide-react"

function Model({ modelPath, scale, position, rotation }) {
  const { scene } = useGLTF(modelPath)

  return (
    <primitive
      object={scene}
      scale={Array.isArray(scale) ? scale : [scale, scale, scale]}
      position={position}
      rotation={rotation}
    />
  )
}

export function ThreeDGenerator() {
  const [modelPath, setModelPath] = useState("/assets/3d/duck.glb")
  const [scale, setScale] = useState(1)
  const [rotationY, setRotationY] = useState(0)
  const controlsRef = useRef()

  const handleDownload = () => {
    // Implementation for downloading the model
    alert("Download functionality would be implemented here")
  }

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  return (
    <Card className="w-full">
      <Tabs defaultValue="model">
        <div className="flex justify-between items-center p-4 border-b">
          <TabsList>
            <TabsTrigger value="model">Model</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={resetCamera}>
              <Rotate3D className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setScale(Math.max(0.5, scale - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setScale(Math.min(2, scale + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="h-[600px] relative">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <PresentationControls
              global
              zoom={1}
              rotation={[0, rotationY, 0]}
              polar={[-Math.PI / 4, Math.PI / 4]}
              azimuth={[-Math.PI / 4, Math.PI / 4]}
            >
              <Model modelPath={modelPath} scale={scale} position={[0, 0, 0]} rotation={[0, rotationY, 0]} />
            </PresentationControls>
            <OrbitControls ref={controlsRef} />
            <Environment preset="studio" />
          </Canvas>

          <TabsContent
            value="settings"
            className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm"
          >
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Scale</Label>
                <Slider value={[scale]} min={0.1} max={2} step={0.1} onValueChange={(value) => setScale(value[0])} />
              </div>
              <div className="space-y-2">
                <Label>Rotation Y</Label>
                <Slider
                  value={[rotationY]}
                  min={0}
                  max={Math.PI * 2}
                  step={0.01}
                  onValueChange={(value) => setRotationY(value[0])}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="export"
            className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm"
          >
            <div className="grid gap-4">
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download Model
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  )
}
