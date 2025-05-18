/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Diwberg de Andrade Pereira                                                     │
│ @file: /whatsapp-instances/components/ConfigDialog.tsx                                               │
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

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"

import { 
  fetchInstanceConfig, 
  saveInstanceConfig, 
} from "@/services/whatsappInstanceService"
import { InstanceConfig, InstanceConfigSchema, WhatsAppInstanceSchema } from "../schemas/instance"
import { Separator } from "@/components/ui/separator"

interface ConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  instance: WhatsAppInstanceSchema | null
}

export default function ConfigDialog({
  open,
  onOpenChange,
  instance,
}: ConfigDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const form = useForm<InstanceConfigSchema>({
    resolver: zodResolver(InstanceConfig),
    defaultValues: {
        rejectCall: false,
        msgCall: "",
        groupsIgnore: false,
        alwaysOnline: false,
        readMessages: false,
        readStatus: false,
        syncFullHistory: false,
        wavoipToken: ""
    }
  })

  useEffect(() => {
    if (open && instance) {
      setLoading(true)
      fetchInstanceConfig(instance.name)
      .then((config) => {
        if (config) {
          form.reset(config);
        }
      })
        .catch(() => {
          toast({
            title: "Error",
            description: "Failed to fetch instance configuration.",
            variant: "destructive",
          })
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [open, instance, form, toast])

  const onSubmit = async (values: InstanceConfigSchema) => {
    if (!instance) return

    setLoading(true)
    try {
      await saveInstanceConfig(instance, values)
      toast({
        title: "Configuration Saved",
        description: "The WhatsApp instance configuration has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save instance configuration.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      onOpenChange(false)
    }
  }

  return (

    <>
      {/* Modal de Configuração da Instância */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#1a1a1a] border-[#333] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
            <DialogHeader>
            <DialogTitle>Configure Instance</DialogTitle>
            <DialogDescription className="text-gray-400">
                {!instance ? "Error fetching instance configuration" : instance?.name}
            </DialogDescription>
            </DialogHeader>
        
            {loading ? (
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 animate-spin text-[#00ff9d]" />
                <p className="text-gray-400">Loading configuration...</p>
                </div>
            </div>
        ) : instance ? (
          <div className="space-y-4 py-4">   
            <div className="space-y-1 mt-4">
                <div className="space-y-1">
                <div className="flex items-center justify-between">
                <FormField
                    control={form.control}
                    name="rejectCall"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between w-full">
                        <FormLabel htmlFor="rejectCall">Reject Call</FormLabel>
                        <FormControl>
                            <Switch
                            id="rejectCall"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-[#00ff9d]"
                            />
                        </FormControl>
                        </FormItem>
                    )}
                    />
                    </div>
                <p className="text-xs text-gray-400">
                    Reject all incoming calls
                </p>
                </div>
                {form.getValues("rejectCall") && (
                    <div className="space-y-2">
                        <FormField
                            control={form.control}
                            name="msgCall"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between w-full">
                                    <FormControl>
                                        <Textarea
                                            id="msgCall"
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            placeholder="Send a message when a call is rejected"
                                            className="bg-[#222] border-[#444] text-white"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                )}
                <Separator />
                <div className="space-y-1">
                    <FormField
                        control={form.control}
                        name="groupsIgnore"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between w-full">
                                <FormLabel htmlFor="groups_ignore">Ignore Groups</FormLabel>
                                <FormControl>
                                    <Switch
                                        id="groups_ignore"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="data-[state=checked]:bg-[#00ff9d]"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <p className="text-xs text-gray-400">
                        Ignore all messages from groups
                    </p>
                </div>
                <Separator />

                <div className="space-y-1">
                    <FormField
                        control={form.control}
                        name="alwaysOnline"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between w-full">
                                <FormLabel htmlFor="alwaysOnline">Always Online</FormLabel>
                                <FormControl>
                                <Switch
                                    id="alwaysOnline"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-[#00ff9d]"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <p className="text-xs text-gray-400">
                        Keep the whatsapp always online
                    </p>
                </div>
                <Separator />

                <div className="space-y-1">
                    <FormField
                        control={form.control}
                        name="readMessages"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between w-full">
                                <FormLabel htmlFor="readMessages">Read Messages</FormLabel>
                                <FormControl>
                                <Switch
                                    id="readMessages"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-[#00ff9d]"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <p className="text-xs text-gray-400">
                        Mark all messages as read
                    </p>
                </div>
                <Separator />

                <div className="space-y-1">
                    <FormField
                        control={form.control}
                        name="syncFullHistory"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between w-full">
                                <FormLabel htmlFor="syncFullHistory">Sync Full History</FormLabel>
                                <FormControl>
                                    <Switch
                                        id="syncFullHistory"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="data-[state=checked]:bg-[#00ff9d]"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <p className="text-xs text-gray-400">
                        Sync all complete chat history on scan QR code
                    </p>
                </div>
                <Separator />

                <div className="space-y-1">
                    <FormField
                        control={form.control}
                        name="readStatus"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between w-full">
                                <FormLabel htmlFor="readStatus">Read Status</FormLabel>
                                <FormControl>
                                    <Switch
                                        id="readStatus"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="data-[state=checked]:bg-[#00ff9d]"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <p className="text-xs text-gray-400">
                        Mark all statuses as read
                    </p>
                </div>
                <Separator />

                <div className="space-y-1 py-3">
                    <FormField
                        control={form.control}
                        name="wavoipToken"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between w-full">
                                <FormControl>
                                    <Input
                                        id="wavoipToken"
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        placeholder="Wavoip Token"
                                        className="bg-[#222] border-[#444] text-white"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
        ) : null}
                <DialogFooter>
        <Button
            variant="outline"
                onClick={() => onOpenChange(false)}
            className="border-[#444] bg-[#333]"
        >
            Cancel
        </Button>
        <Button
            onClick={() => {
                onSubmit(form.getValues())
            }}
            disabled={loading}
            className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
        >
            Save
        </Button>
        </DialogFooter>
            </form>
            </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}