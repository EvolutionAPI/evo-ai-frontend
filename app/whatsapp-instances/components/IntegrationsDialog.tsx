/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Diwberg de Andrade Pereira                                                     │
│ @file: /whatsapp-instance/components/IntegrationsDialog.tsx                                               │
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

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Bot, Plus, Puzzle, RefreshCw, Trash2 } from "lucide-react"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { createEvolutionBotConfig, deleteEvolutionBotConfig, fetchEvolutionBotConfig, updateEvolutionBotConfig } from "@/services/whatsappInstanceService"
import { EvolutionBotConfig, EvolutionBotSchema, WhatsAppInstanceSchema } from "../schemas/instance"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogHeader } from "@/components/ui/alert-dialog"

interface IntegrationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  instance: WhatsAppInstanceSchema | null
}

export function IntegrationsDialog({
  open,
  onOpenChange,
  instance,
}: IntegrationsDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [evolutionBotConfig, setEvolutionBotConfig] = useState<EvolutionBotConfig[] | null>(null)
  const [selectedConfigIndex, setSelectedConfigIndex] = useState<number | null>(null)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [botToDelete, setBotToDelete] = useState<string | null>(null);

  const form = useForm<EvolutionBotConfig>({
    resolver: zodResolver(EvolutionBotSchema),
    defaultValues: {
      enabled: false,
      description: "",
      agentUrl: "",
      apiKey: "",
      triggerType: "all",
      triggerOperator: "contains",
      triggerValue: "",
      expire: 0,
      keywordFinish: "!exit",
      delayMessage: 1000,
      unknownMessage: "Sorry, I didn't understand your message.",
      listeningFromMe: false,
      stopBotFromMe: false,
      keepOpen: false,
      debounceTime: 3,
      ignoreJids: [],
    },
  })

  useEffect(() => {
    if (open && instance) {
      setLoading(true)
      
      fetchEvolutionBotConfig(instance.name)
        .then((configs) => {
          setEvolutionBotConfig(configs)
          if (configs && configs.length > 0) {
            setTimeout(() => {
                setSelectedConfigIndex(0)
                form.reset(configs[0]);
              }, 0);
          }
        })
        .catch((error) => {
          console.error("Error loading Evolution Bot config:", error)
          toast({
            title: "Error",
            description: "Failed to fetch Evolution Bot configurations.",
            variant: "destructive",
          })
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [open, instance, form, toast])

  const handleConfigChange = (index: number) => {
    if (evolutionBotConfig && index < evolutionBotConfig.length) {
      setSelectedConfigIndex(index)
      form.reset(evolutionBotConfig[index])
    }
  }
  
  const handleCreateConfig = () => {
    form.reset({
      enabled: false,
      description: "New EvoAI Bot",
      agentUrl: "https://exemple.com",
      apiKey: "Iu7BcDiZijpxKs1YRpwCyFnB",
      triggerType: "all",
      triggerOperator: "contains",
      triggerValue: "",
      expire: 0,
      keywordFinish: "!exit",
      delayMessage: 1000,
      unknownMessage: "Sorry, I didn't understand your message.",
      listeningFromMe: false,
      stopBotFromMe: false,
      keepOpen: true,
      debounceTime: 3,
      ignoreJids: [],
    })
    
    setSelectedConfigIndex(null)
  }
  
  const onSubmit = async (values: EvolutionBotConfig) => {
    if (!instance) return

    setLoading(true)
    try {
      if (selectedConfigIndex !== null && evolutionBotConfig) {
        // Atualizando configuração existente
        //console.log(values)
        const response = await updateEvolutionBotConfig(
          instance.name, 
          evolutionBotConfig[selectedConfigIndex].id || "",
          values,
        );

        if(typeof response === "string"){
          toast({
              title: "Error",
              description: response as string,
              variant: "destructive",
            })
      }else if (response === null) {
          toast({
              title: "Error",
              description: "Failed to save bot configuration.",
              variant: "destructive",
            })
      }else {
          setEvolutionBotConfig([...(evolutionBotConfig || []), values]);
          toast({
              title: "Configuration Saved",
              description: "The bot configuration has been updated successfully.",
          })

          onOpenChange(false)
      }

      } else {
        // Criando nova configuração
        //console.log(values)
        const response = await createEvolutionBotConfig(instance.name, values);

        //console.log(typeof response)

        if(typeof response === "string"){
            toast({
                title: "Error",
                description: response as string,
                variant: "destructive",
              })
        }else if (response === null) {
            toast({
                title: "Error",
                description: "Failed to save bot configuration.",
                variant: "destructive",
              })
        }else {
            setEvolutionBotConfig([...(evolutionBotConfig || []), values]);
            toast({
                title: "Configuration Saved",
                description: "The bot configuration has been updated successfully.",
            })

            onOpenChange(false)
        }
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save bot configuration.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = () => {
    const id = evolutionBotConfig?.[selectedConfigIndex as number]?.id || "";
    const description = evolutionBotConfig?.[selectedConfigIndex as number]?.description || "this bot";
    
    setBotToDelete(id);
    setShowDeleteAlert(true);
  };
  
  const confirmDelete = async () => {
    if (!botToDelete || !instance) return;
    
    setLoading(true);
    try {
      await deleteEvolutionBotConfig(instance.name, botToDelete);

      const updatedConfigs = await fetchEvolutionBotConfig(instance.name);
      setEvolutionBotConfig(updatedConfigs);
      
      if (updatedConfigs && updatedConfigs.length > 0) {
        setSelectedConfigIndex(0);
        form.reset(updatedConfigs[0]);
      } else {
        setSelectedConfigIndex(null);
        handleCreateConfig();
      }
      
      toast({
        title: "Bot Deleted",
        description: "The bot configuration has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bot configuration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowDeleteAlert(false);
      setBotToDelete(null);
    }
  };
  

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-[#1a1a1a] border-[#333] text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-[#00ff9d]" />
            <span>Integrations - {instance?.name}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure third-party integrations for this WhatsApp instance
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="h-8 w-8 animate-spin text-[#00ff9d]" />
              <p className="text-gray-400">Loading integrations...</p>
            </div>
          </div>
        ) : instance ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {/* Evolution Bot Integration */}
                <AccordionItem value="evolutionBot" className="border-[#333] bg-[#222] px-4 mb-2 rounded-md">
                  <AccordionTrigger className="text-white hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-[#00ff9d]" />
                      <span>EvoAi Bot</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
  <div className="space-y-4 py-2 px-3">
    {/* Seletor de configurações */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Select
          value={selectedConfigIndex !== null ? selectedConfigIndex.toString() : ""}
          onValueChange={(value) => handleConfigChange(parseInt(value))}
          disabled={loading || !evolutionBotConfig || evolutionBotConfig.length === 0}
        >
          <SelectTrigger className="w-[240px] bg-[#1a1a1a] border-[#444] text-white">
            <SelectValue placeholder="Select a bot configuration" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#444] text-white">
            {evolutionBotConfig?.map((config, index) => (
              <SelectItem key={index} value={index.toString()}>
                {config?.description || `Bot Config ${index + 1}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          type="button"
          size="sm"
          onClick={handleCreateConfig}
          disabled={loading}
          className="bg-[#00ff9d] text-black hover:bg-[#00cc7d] ml-2"
        >
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>
      {selectedConfigIndex !== null && (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={handleDeleteClick}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      )}
    </div>

    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-200">Basic Settings</h3>

      <FormField
        control={form.control}
        name="enabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between">
            <FormLabel>Enable EvoAi Bot</FormLabel>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="data-[state=checked]:bg-[#00ff9d]"
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Bot description"
                className="bg-[#1a1a1a] border-[#444] text-white"
              />
            </FormControl>
            <FormDescription className="text-xs text-gray-400">
              A description of what this bot does
            </FormDescription>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="agentUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Agent URL</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="https://api.evolutionbot.com"
                className="bg-[#1a1a1a] border-[#444] text-white"
              />
            </FormControl>
            <FormDescription className="text-xs text-gray-400">
              URL of the EvoAi Bot API
            </FormDescription>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="apiKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>API Key (Optional)</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Your EvoAi Bot API key"
                className="bg-[#1a1a1a] border-[#444] text-white"
              />
            </FormControl>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
    </div>
    
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-200">Trigger Settings</h3>
      
      <FormField
        control={form.control}
        name="triggerType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Trigger Type</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="bg-[#1a1a1a] border-[#444] text-white">
                  <SelectValue placeholder="Select Trigger Type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-[#1a1a1a] border-[#444] text-white">
                <SelectItem value="all">All messages</SelectItem>
                <SelectItem value="keyword">Keyword</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
      
      {form.watch("triggerType") === "keyword" && (
        <>
          <FormField
            control={form.control}
            name="triggerOperator"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trigger Operator</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-[#1a1a1a] border-[#444] text-white">
                      <SelectValue placeholder="Select Trigger Operator" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#1a1a1a] border-[#444] text-white">
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="startsWith">Starts with</SelectItem>
                    <SelectItem value="endsWith">Ends with</SelectItem>
                    <SelectItem value="regex">Regex</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="triggerValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trigger</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ex: !bot, /start, etc."
                    className="bg-[#1a1a1a] border-[#444] text-white"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-400">
                  The text or pattern that will activate the bot
                </FormDescription>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
    
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-200">General Settings</h3>
      
      <FormField
        control={form.control}
        name="expire"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Expire in minutes</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                className="bg-[#1a1a1a] border-[#444] text-white"
              />
            </FormControl>
            <FormDescription className="text-xs text-gray-400">
              Inactivity time until session ends (0 = no expiration)
            </FormDescription>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="keywordFinish"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Keyword Finish</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Ex: !exit, stop, etc."
                className="bg-[#1a1a1a] border-[#444] text-white"
              />
            </FormControl>
            <FormDescription className="text-xs text-gray-400">
              Keyword to finish the bot session
            </FormDescription>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="delayMessage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Default Delay Message</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                className="bg-[#1a1a1a] border-[#444] text-white"
              />
            </FormControl>
            <FormDescription className="text-xs text-gray-400">
              Delay in milliseconds between messages (0 = no delay)
            </FormDescription>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="unknownMessage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Unknown Message</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Sorry, I didn't understand your message."
                className="bg-[#1a1a1a] border-[#444] text-white min-h-20"
              />
            </FormControl>
            <FormDescription className="text-xs text-gray-400">
              Message sent when the bot doesn't understand the command
            </FormDescription>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
    </div>
    
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-200">Behavior</h3>
      
      <FormField
        control={form.control}
        name="listeningFromMe"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between">
            <div>
              <FormLabel>Listening from me</FormLabel>
              <FormDescription className="text-xs text-gray-400">
                Process messages sent from the same number
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="data-[state=checked]:bg-[#00ff9d]"
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="stopBotFromMe"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between">
            <div>
              <FormLabel>Stop bot from me</FormLabel>
              <FormDescription className="text-xs text-gray-400">
                End session when sending a message
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="data-[state=checked]:bg-[#00ff9d]"
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="keepOpen"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between">
            <div>
              <FormLabel>Keep open</FormLabel>
              <FormDescription className="text-xs text-gray-400">
                Do not end session automatically
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="data-[state=checked]:bg-[#00ff9d]"
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="debounceTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Debounce Time</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                className="bg-[#1a1a1a] border-[#444] text-white"
              />
            </FormControl>
            <FormDescription className="text-xs text-gray-400">
              Minimum interval between message processing (in seconds)
            </FormDescription>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />
    </div>
    
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-200">Additional Settings</h3>
      
      <FormField
        control={form.control}
        name="splitMessages"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between">
            <div>
              <FormLabel>Split Messages</FormLabel>
              <FormDescription className="text-xs text-gray-400">
                Split long messages into multiple parts
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="data-[state=checked]:bg-[#00ff9d]"
              />
            </FormControl>
          </FormItem>
        )}
      />
  
  {form.watch("splitMessages") && (
    <FormField
      control={form.control}
      name="timePerChar"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Time per character</FormLabel>
          <FormControl>
            <Input
              type="number"
              {...field}
              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              className="bg-[#1a1a1a] border-[#444] text-white"
            />
          </FormControl>
          <FormDescription className="text-xs text-gray-400">
            Typing delay per character in milliseconds (0 = no delay)
          </FormDescription>
          <FormMessage className="text-red-400" />
        </FormItem>
      )}
    />
  )}
    </div>
  </div>
</AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Button 
                type="submit" 
                className="mt-4 bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
                disabled={loading}
              >
                Save
              </Button>
            </form>
          </Form>
        ) : (
          <div className="py-4 text-center text-gray-400">
            No instance selected
          </div>
        )}
        
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

    {/* Alert Dialog para confirmação de exclusão */}
    <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
      <AlertDialogContent className="bg-[#1a1a1a] border-[#333] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            This will permanently delete the bot configuration.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="bg-[#333] text-white border-[#444] hover:bg-[#444]"
            onClick={() => {
              setShowDeleteAlert(false);
              setBotToDelete(null);
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={confirmDelete}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}