/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Diwberg de Andrade Pereira                                                     │
│ @file: /whatsapp-instances/page.tsx                                               │
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

import { useCallback, useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
} from "@/components/ui/card"

import {
  AlertCircle,
  Plus,
  RefreshCw,
} from "lucide-react"
import { 
  listInstances, 
} from "@/services/whatsappInstanceService"
import { WhatsAppInstanceSchema } from "./schemas/instance"
import InstanceTable from "./components/InstanceTable"
import AddInstanceDialog from "./components/AddInstanceDialog"

export default function WhatsAppInstancesPage() {
  const { toast } = useToast()
  const [instances, setInstances] = useState<WhatsAppInstanceSchema[]>([])
  const [loading, setLoading] = useState(true)
  const [showInstanceDialog, setShowInstanceDialog] = useState(false)

  // Função para carregar as instâncias
  const loadInstances = useCallback(async () => {
    setLoading(true)
    try {
      const instancesData: WhatsAppInstanceSchema[] = await listInstances()
      setInstances(instancesData)
    } catch (error) {
      toast({
        title: "Error loading instances",
        description: "Failed to load WhatsApp instances. Please try again.",
        variant: "destructive",
      })
      console.error("Error loading instances:", error)
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadInstances()
  }, [loadInstances])


  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">WhatsApp Instances</h1>
          <p className="text-gray-400 mt-1">
            Manage your WhatsApp instances to connect to Evolution API
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => loadInstances()} 
            variant="outline"
            className="border-[#444] text-black dark:text-white hover:bg-[#333] hover:text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={() => setShowInstanceDialog(true)}
            className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Instance
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-[#00ff9d]" />
            <p className="text-gray-400">Loading instances...</p>
          </div>
        </div>
      ) : instances.length === 0 ? (
        <Card className="bg-[#1a1a1a] border-[#333] text-white">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center min-h-[200px]">
            <div className="text-gray-400 text-center space-y-3">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-500" />
              <h3 className="text-xl font-medium text-gray-300">No WhatsApp Instances Found</h3>
              <p className="max-w-md mx-auto">
                You haven't added any WhatsApp instances yet. Click the "Add Instance" button to get started or check you environment variables.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border border-[#333] bg-[#1a1a1a]">
            <InstanceTable
                instances={instances}
                setInstances={setInstances}
            />
        </div>
      )}
      <AddInstanceDialog
        open={showInstanceDialog}
        onOpenChange={setShowInstanceDialog}
        setInstances={setInstances}
      />
    </div>
  )
}