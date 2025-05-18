/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Diwberg de Andrade Pereira                                                     │
│ @file: /whatsapp-instance/schemas/instance.ts                                               │
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

import { z } from "zod";

  
  export type CreateWhatsAppInstanceFormValues = z.infer<typeof CreateWhatsAppInstanceSchema>;

// Interface para a instância de WhatsApp
export const WhatsAppInstance = z.object({
    id: z.string(),
    name: z.string(),
    token: z.string().optional(),
    ownerJid: z.string().optional(),
    connectionStatus: z.enum(["close", "open", "connecting"]).default("close"),
    disconnectionAt: z.string().optional(),
    profilePicUrl: z.string().optional(),
});

export type WhatsAppInstanceSchema = z.infer<typeof WhatsAppInstance>;

// Schema para criação de instância - apenas os campos necessários para criar
export const CreateWhatsAppInstance = WhatsAppInstance.pick({
    name: true,
}).extend({
    integration: z.enum(["WHATSAPP-BAILEYS", "WHATSAPP-BUSINESS"]),
})

export type CreateWhatsAppInstanceSchema = z.infer<typeof CreateWhatsAppInstance>;

// Adicione no schemas/instance.ts

// Schema para o objeto "instance" na resposta
export const ResponseInstance = z.object({
    instanceName: z.string(),
    instanceId: z.string(),
    integration: z.string(),
    webhookWaBusiness: z.string().nullable(),
    accessTokenWaBusiness: z.string(),
    status: z.enum(["close", "open", "connecting"])
});

export type ResponseInstanceType = z.infer<typeof ResponseInstance>;

// Interface para as configurações da instância
export const InstanceConfig = z.object({
    rejectCall: z.boolean(),
    msgCall: z.string().default(""),
    groupsIgnore: z.boolean(),
    alwaysOnline: z.boolean(),
    readMessages: z.boolean(),
    readStatus: z.boolean(),
    syncFullHistory: z.boolean(),
    wavoipToken: z.string().optional()
});

export type InstanceConfigSchema = z.infer<typeof InstanceConfig>;


// Schema para a resposta completa da API
export const InstanceResponse = z.object({
    instance: ResponseInstance,
    hash: z.string(),
    webhook: z.record(z.any()).optional(),
    websocket: z.record(z.any()).optional(),
    rabbitmq: z.record(z.any()).optional(),
    nats: z.record(z.any()).optional(),
    sqs: z.record(z.any()).optional(),
    settings: InstanceConfig
});

export type InstanceResponseType = z.infer<typeof InstanceResponse>;



export const EvolutionBotSchema = z.object({
    id: z.string().optional(),
    enabled: z.boolean().default(false),
    description: z.string().optional(),
    agentUrl: z.string(),
    apiKey: z.string().optional(),
    
    // Configurações de gatilho
    triggerType: z.enum(["all", "keyword"]).default("all"),
    triggerOperator: z.enum(["contains", "equals", "startsWith", "endsWith", "regex"]).optional(),
    triggerValue: z.string().optional(),
    
    // Parâmetros de controle
    expire: z.number().int().min(0).default(0),
    keywordFinish: z.string().default("!exit"),
    delayMessage: z.number().int().min(0).default(1000),
    unknownMessage: z.string().default("Sorry, I didn't understand your message."),
    
    // Configurações de comportamento
    listeningFromMe: z.boolean().default(false),
    stopBotFromMe: z.boolean().default(false),
    keepOpen: z.boolean().default(true),
    debounceTime: z.number().int().min(0).default(3),
    
    // Configurações adicionais
    splitMessages: z.boolean().default(false),
    timePerChar: z.number().int().min(0).default(0),
    
    // Metadados
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    instanceId: z.string().optional(),
    
    // Lista de JIDs a ignorar
    ignoreJids: z.array(z.string()).optional(),
  });

export type EvolutionBotConfig = z.infer<typeof EvolutionBotSchema>;
