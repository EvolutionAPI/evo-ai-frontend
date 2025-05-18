/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Diwberg de Andrade Pereira                                                     │
│ @file: /whatsapp-instances/components/InstanceTable.tsx                                               │
│ Developed by: Diwberg de Andrade Pereira                                                   │
│ Creation date: May 17, 2025                                                  │
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

import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  RefreshCw,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  QrCodeIcon,
  WebhookIcon
} from "lucide-react"
import {  
  checkInstanceStatus, 
  deleteInstance
} from "@/services/whatsappInstanceService"
import { WhatsAppInstanceSchema } from "../schemas/instance"
import DeleteDialog from "./DeleteDialog"
import ConfigDialog from "./ConfigDialog"
import { IntegrationsDialog } from "./IntegrationsDialog"
import QRCodeDialog from "./QRCodeDialog"

interface InstanceTableProps {
  instances: WhatsAppInstanceSchema[]
  setInstances: React.Dispatch<React.SetStateAction<WhatsAppInstanceSchema[]>>
}

export default function InstanceTable({
  instances,
  setInstances,
}: InstanceTableProps) {
  const { toast } = useToast()
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstanceSchema | null>(null)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [showIntegrationsDialog, setShowIntegrationsDialog] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedQRInstance, setSelectedQRInstance] = useState<WhatsAppInstanceSchema | null>(null);
  
  // Verificar o status de uma instância
  const handleCheckStatus = useCallback(async (instance: WhatsAppInstanceSchema) => {
    try {
      const updatedInstances = instances.map(i => 
        i.id === instance.id ? { ...i, status: "loading" } : i
      )
      setInstances(updatedInstances)
      
      // Verifica o status
      const status = await checkInstanceStatus(instance.name)
      // Atualiza o status com o resultado
      const finalInstances = instances.map(i => 
        i.id === instance.id ? { ...i, connectionStatus: status } : i
      )
      setInstances(finalInstances)
      toast({
        title: "Instance Status",
        description: `WhatsApp instance "${instance.name}" has been ${status}.`,
      })
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to check WhatsApp instance status",
        variant: "destructive",
      })
      
      // Marca como desconectado em caso de erro
      const errorInstances = instances.map(i => 
        i.id === instance.id ? { ...i, status: "disconnected" } : i
      )
      setInstances(errorInstances)
    }
  }, [instances, setInstances, toast])

  // Função para copiar a API key para o clipboard
  const copyApiKey = useCallback((apiKey: string) => {
    navigator.clipboard.writeText(apiKey)
    toast({
      title: "API Key Copied",
      description: "API key has been copied to clipboard.",
    })
  }, [toast])

  // Função para alternar a visibilidade da API key
  const toggleApiKeyVisibility = useCallback((id: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const openDelete = useCallback((instance: WhatsAppInstanceSchema) => {
    setShowDeleteDialog(true)
    setSelectedInstance(instance)
  }, [])

  const handleDelete = useCallback(async () => {
    if (!selectedInstance) return
    try {
      await deleteInstance(selectedInstance.name)
      setInstances(instances.filter(instance => instance.name !== selectedInstance.name))
      toast({
        title: "Instance Deleted",
        description: `WhatsApp instance has been deleted.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete WhatsApp instance.",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setSelectedInstance(null)
    }
  }, [selectedInstance, toast])
  
  const openConfig = useCallback((instance: WhatsAppInstanceSchema) => {
    setShowConfigDialog(true)
    setSelectedInstance(instance)
  }, [])

  const handleQRCodeClick = (instance: WhatsAppInstanceSchema) => {
    setSelectedQRInstance(instance);
    setShowQRCode(true);
  };

const handleOpenIntegrationsDialog = (instance: WhatsAppInstanceSchema) => {
  setSelectedInstance(instance)
  setShowIntegrationsDialog(true)
}


  return (
    <div className="rounded-md border border-[#333] bg-[#1a1a1a]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-[#222] border-[#333]">
            <TableHead className="text-gray-300">Status</TableHead>
            <TableHead className="text-gray-300">Name</TableHead>
            <TableHead className="text-gray-300">Token</TableHead>
            <TableHead className="text-gray-300 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instances.map((instance) => (
            <TableRow key={instance.id} className="hover:bg-[#222] border-[#333]">
              <TableCell>
                <div className="flex items-center gap-2">
                  {instance.connectionStatus === null ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                  ) : instance.connectionStatus === "open" ? (
                    <Badge className="bg-gray-500 hover:bg-gray-400">
                      <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                          <span>On</span>
                    </div>
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-500 hover:bg-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <span>Off</span>
                    </div>
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium text-white">
                <div className="flex items-center gap-2">
                    {!instance.profilePicUrl ? "" : (
                        <img className="rounded-full" src={instance.profilePicUrl} alt={instance.name} width={30} height={30} />
                    )}
                    {instance.name}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-300 font-thin">{instance.ownerJid ? instance.ownerJid.split("@")[0] : "No number"}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="bg-[#222] text-gray-300 px-2 py-1 rounded text-xs font-mono">
                    {showApiKey[instance.id] 
                      ? instance.token 
                      : "•".repeat(Math.min(20, instance.token?.length || 0))}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleApiKeyVisibility(instance.id)}
                    className="h-8 w-8 text-gray-400"
                  >
                    {showApiKey[instance.id] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyApiKey(instance.token || "")}
                    className="h-8 w-8 text-gray-400"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQRCodeClick(instance)}
                    className="h-8 w-8 text-gray-400"
                  >
                    <QrCodeIcon className="h-4 w-4 text-[#00ff9d]" />
                  </Button>
                  {selectedQRInstance && (
                  <QRCodeDialog
                    open={showQRCode}
                    onOpenChange={setShowQRCode}
                    instance={selectedQRInstance}
                  />
                )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async() => handleCheckStatus(instance)}
                    className="h-8 w-8 text-gray-400"
                    disabled={instance.connectionStatus === null}
                  >
                    <RefreshCw className={`h-4 w-4 ${instance.connectionStatus === null ? "animate-spin" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenIntegrationsDialog(instance)}
                    className="h-8 w-8 text-gray-400"
                  >
                    <WebhookIcon className="h-4 w-4" />
                  </Button>
                  {selectedInstance && (
                    <IntegrationsDialog
                      open={showIntegrationsDialog}
                      onOpenChange={setShowIntegrationsDialog}
                      instance={selectedInstance}
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openConfig(instance)}
                    className="h-8 w-8 text-gray-400"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <ConfigDialog
                    open={showConfigDialog}
                    onOpenChange={setShowConfigDialog}
                    instance={selectedInstance}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDelete(instance)}
                    className="h-8 w-8 text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <DeleteDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    onDelete={handleDelete}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}

        </TableBody>
      </Table>
    </div>
  )
}