/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Diwberg de Andrade Pereira                                                     │
│ @file: /whatsapp-instances/components/AddInstanceDialog.tsx                                               │
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

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  FormMessage,
} from "@/components/ui/form"
import { CreateWhatsAppInstance, CreateWhatsAppInstanceSchema, WhatsAppInstanceSchema } from "../schemas/instance"
import { addInstance } from "@/services/whatsappInstanceService"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddInstanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  setInstances: React.Dispatch<React.SetStateAction<WhatsAppInstanceSchema[]>>
}

export default function AddInstanceDialog({ 
  open, 
  onOpenChange,
  setInstances
}: AddInstanceDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<CreateWhatsAppInstanceSchema>({
    resolver: zodResolver(CreateWhatsAppInstance),
    defaultValues: {
        name: "",
        integration: "WHATSAPP-BAILEYS"
    }
  })

  const onSubmit = async (values: CreateWhatsAppInstanceSchema) => {
    setIsSubmitting(true)
    try {
      const instance = await addInstance(values.name, values.integration)
      setInstances((instances) => [...instances, instance])
      toast({
        title: "Instance Added",
        description: `WhatsApp instance "${values.name}" has been added.`,
      })
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add WhatsApp instance.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#333] text-white">
        <DialogHeader>
          <DialogTitle>Add WhatsApp Instance</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter the name for the new WhatsApp instance.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instance Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Instance name"
                      className="bg-[#222] border-[#444] text-white"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="integration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Integration</FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="bg-[#222] border-[#444] text-white">
                        <SelectValue placeholder="Select Integration" className="text-white" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#222] border-[#444] text-white">
                        <SelectItem className="bg-[#333]" value="WHATSAPP-BAILEYS">WhatsApp Baileys</SelectItem>
                        <SelectItem className="bg-[#333]" value="WHATSAPP-BUSINESS">WhatsApp Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-[#444] text-black hover:bg-[#333] hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
              >
                {isSubmitting ? "Adding..." : "Add Instance"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}