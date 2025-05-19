/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Diwberg de Andrade Pereira                                                     │
│ @file: /whatsapp-instance/components/QRCodeDialog.tsx                                               │
│ Developed by: Diwberg de Andrade Pereira                                                   │
│ Creation date: May 18, 2025                                                  │
│ Contact: diwberg@zapflow.app                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ @copyright © Evolution API 2025. All rights reserved.                        │
│ Licensed under the Apache License, Version 2.0                               │
│                                                                              │
│ You may not use this file except in compliance with the License.             │
│ You may obtain a copy of the License at                                      │
│                                                                              │
│    http://www.apache.org/licenses/LICENSE-2.0                                │
│                                                                              │
│ Unless required by applicable law or agreed to in writing, software          │
│ distributed under the License is distributed on an "AS IS" BASIS,            │
│ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.     │
│ See the License for the specific language governing permissions and          │
│ limitations under the License.                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ @important                                                                   │
│ For any future changes to the code in this file, it is recommended to        │
│ include, together with the modification, the information of the developer    │
│ who changed it and the date of modification.                                 │
└──────────────────────────────────────────────────────────────────────────────┘
*/

"use client"

import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { 
  QrCode as QrCodeIcon, 
  RefreshCw, 
  Smartphone, 
  Check, 
  WifiOff 
} from "lucide-react"
import Image from "next/image"
import { WhatsAppInstanceSchema } from "../schemas/instance"
import { checkConnectionQRCode, fetchConnectionQRCode } from "@/services/whatsappInstanceService"

interface QRCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  instance: WhatsAppInstanceSchema | null
}

export default function QRCodeDialog({
  open,
  onOpenChange,
  instance,
}: QRCodeDialogProps) {

  const TIMER_TO_EXPIRE_QRCODE = 45

  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [qrCodeStatus, setQrCodeStatus] = useState<"loading" | "ready" | "expired" | "connected" | "failed">("loading")
  const [timeLeft, setTimeLeft] = useState(TIMER_TO_EXPIRE_QRCODE) // segundos de vida do QR code
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  


  const fetchQRCode = async () => {
    if (!instance) return
    if(instance.connectionStatus === "open") {
        setTimeout(() => {
            setQrCodeStatus("connected")
            onOpenChange(false)
            return
        }, 1500)
    }
    
    setLoading(true)
    setQrCodeStatus("loading")
    
    try {
      // Substitua pelo endpoint real da sua API
      const connection = await fetchConnectionQRCode(instance.name)
      
      //console.log(connection)
      if (connection.base64) {
        setQrCode(connection.base64)
        setQrCodeStatus("ready")
        setTimeLeft(TIMER_TO_EXPIRE_QRCODE) // segundos de vida do QR code
        
        // Iniciar cronômetro
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
        
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current as NodeJS.Timeout)
              setQrCodeStatus("expired")
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } catch (error) {
      setQrCodeStatus("failed")
      toast({
        title: "Error",
        description: "Failed to connect to server.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Verificar status da conexão periodicamente
  const checkConnectionStatus = async () => {
    if (!instance || qrCodeStatus !== "ready") return
    
    try {
      const connection = await checkConnectionQRCode(instance.name)
      
      if (connection.instance.state === "open") {
        setQrCodeStatus("connected")
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
        
        toast({
          title: "Connected",
          description: "WhatsApp instance connected successfully.",
        })

        setTimeout(() => {
          onOpenChange(false)
        }, 1500)
      }
    } catch (error) {
      console.error("Error checking connection status:", error)
    }
  }
  
  // Verificar status a cada 5 segundos quando o QR code estiver ativo
  useEffect(() => {
    let statusChecker: NodeJS.Timeout | null = null
    
    if (qrCodeStatus === "ready") {
      statusChecker = setInterval(checkConnectionStatus, 5000)
    }
    
    return () => {
      if (statusChecker) {
        clearInterval(statusChecker)
      }
    }
  }, [qrCodeStatus, instance])
  
  useEffect(() => {
    if (open && instance) {
      fetchQRCode()
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [open, instance])
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-[#333] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCodeIcon className="w-5 h-5 text-[#00ff9d]" />
            <span>Connect WhatsApp - {instance?.name}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Scan the QR code with your WhatsApp app to connect this instance.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-4">
          {qrCodeStatus === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <RefreshCw className="h-16 w-16 animate-spin text-[#00ff9d]" />
              <p className="text-gray-400">Generating QR code...</p>
            </div>
          )}
          
          {qrCodeStatus === "ready" && qrCode && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative bg-white p-4 rounded-lg">
                <Image 
                  src={`${qrCode}`} 
                  alt="WhatsApp QR Code" 
                  width={250} 
                  height={250}
                />
                <div className="absolute -top-3 -right-3 bg-[#00ff9d] text-black font-bold rounded-full h-8 w-32 flex items-center justify-center">
                  {formatTime(timeLeft)}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400 mt-2">
                <Smartphone className="h-5 w-5" />
                <span>Open WhatsApp on your phone and scan this code</span>
              </div>
            </div>
          )}
          
          {qrCodeStatus === "expired" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <WifiOff className="h-16 w-16 text-orange-500" />
              <p className="text-gray-400">QR code expired. Please refresh to generate a new one.</p>
              <Button 
                onClick={fetchQRCode} 
                disabled={loading}
                className="bg-[#00ff9d] text-black hover:bg-[#00cc7d] mt-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh QR Code
              </Button>
            </div>
          )}
          
          {qrCodeStatus === "connected" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="rounded-full bg-green-500/20 p-4">
                <Check className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-green-500 font-bold text-lg mt-2">Connected Successfully!</p>
            </div>
          )}
          
          {qrCodeStatus === "failed" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <WifiOff className="h-16 w-16 text-red-500" />
              <p className="text-gray-400">Failed to generate QR code. Please try again.</p>
              <Button 
                onClick={fetchQRCode}
                disabled={loading}
                className="bg-[#00ff9d] text-black hover:bg-[#00cc7d] mt-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Try Again
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#444] text-black dark:text-white hover:bg-[#333] hover:text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}