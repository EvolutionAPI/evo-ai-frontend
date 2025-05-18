/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Diwberg de Andrade Pereira                                                     │
│ @file: /service/whatsappInstanceService.tsx                                               │
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
import axios from "axios";

import { EvolutionBotConfig, InstanceConfigSchema, InstanceResponseType, WhatsAppInstanceSchema } from "@/app/whatsapp-instances/schemas/instance";

const urlKey = process.env.NEXT_PUBLIC_EVOLUTION_URL;
const apiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY;

const api = axios.create({
    baseURL: urlKey,
    headers: {
      "Content-Type": "application/json",
      "apikey": apiKey
    },
  });

// Função para listar as instâncias WhatsApp do ambiente
export const listInstances = async () => {

  try {
    const { data } = await api.get<WhatsAppInstance[]>("/instance/fetchInstances")
    return !data ? [] : data
  } catch (error) {
    console.error("Error loading WhatsApp instances:", error);
    return [];
}
}

// Função para adicionar uma nova instância
export const addInstance = async (name: string, integration: string): Promise<WhatsAppInstanceSchema> => {
  try {
    const response = await api.post<InstanceResponseType>("/instance/create", {
        instanceName: name,
        integration: integration
    })

    //console.log(response.data)
    // Mapear o retorno da API para o formato usado na sua aplicação
    return {
        id: response.data.instance.instanceId,
        name: response.data.instance.instanceName,
        token: response.data.hash,
        ownerJid: "",
        connectionStatus: response.data.instance.status,
    };
  } catch (error) {
    console.error("Error adding WhatsApp instance:", error);
    throw new Error("Failed to add WhatsApp instance");
  }
};

// Função para deletar uma instância
export const deleteInstance = async (instanceName: string): Promise<void> => {
  try {
    await api.delete(`/instance/delete/${instanceName}`)

  } catch (error) {
    console.error("Error deleting WhatsApp instance:", error);
    throw new Error("Failed to delete WhatsApp instance");
  }
};

// Função para verificar o status de uma instância
export const checkInstanceStatus = async (instance: string): Promise<"open" | "close"> => {

  try {

    const response = await api.get(
      `/instance/connectionState/${instance}`
    );
    return response.data.instance.state
  } catch (error) {
    console.error("Error checking WhatsApp instance status:", error);
    return "close";
  }
};


// Função para buscar as configurações de uma instância
export const fetchInstanceConfig = async (instance: string): Promise<InstanceConfigSchema | null> => {
    try {
      const response = await api.get<InstanceConfigSchema>(`/settings/find/${instance}`)
      return response.data

    } catch (error) {
      console.error("Error fetching instance configuration:", error);
      
      // Retorna configurações padrão em caso de erro
      return null
    }
  };
  
// Função para salvar as configurações de uma instância
export const saveInstanceConfig = async (
instance: WhatsAppInstanceSchema, 
config: InstanceConfigSchema
): Promise<void> => {
try {
    await api.post(`/settings/set/${instance.name}`, config);
} catch (error) {
    console.error("Error saving instance configuration:", error);
    throw new Error("Failed to save instance configuration");
}
};


export const fetchEvolutionBotConfig = async (instanceName: string): Promise<EvolutionBotConfig [] | null> => {
    try {
      const response = await api.get(`/EvoAI/find/${instanceName}`);
      
      //console.log(response.data)

      if (response.data) {
        return response.data
      }
      return null;
    } catch (error) {
      console.error("Error fetching Evolution Bot configuration:", error);
      return null;
    }
  };

export const updateEvolutionBotConfig = async (instanceName: string,configId: string, config: EvolutionBotConfig): Promise<EvolutionBotConfig | null> => {
    try {
      const response = await api.put(`/EvoAI/update/${configId}/${instanceName}`, config);
      
      //console.log(response.data)

      if (response.data) {
        return response.data
      }
      return null;
    } catch (error) {
      if (error instanceof Error) {
        //@ts-ignore
        console.error("Error updating Evolution Bot configuration:", error.response.data.response.message);
        //@ts-ignore
        return error.response.data.response.message
      } else {
        console.error("An unknown error occurred while updating Evolution Bot configuration");
      }
      return null;
    }
  };

export const createEvolutionBotConfig = async (instanceName: string, config: EvolutionBotConfig): Promise<EvolutionBotConfig | null | string> => {
    try {
      const response = await api.post(`/EvoAI/create/${instanceName}`, {
        ...config,
        apiUrl: config.agentUrl
      });
      
      //console.log(response.data)

      if (response.data) {
        return response.data
      }
      return null;
    } catch (error) {
      if (error instanceof Error) {
        //@ts-ignore
        console.error("Error creating Evolution Bot configuration:", error.response.data.response.message);
        //@ts-ignore
        return error.response.data.response.message
      } else {
        console.error("An unknown error occurred while creating Evolution Bot configuration");
      }
      return null;
    }
  };

export const deleteEvolutionBotConfig = async (instanceName: string, instanceId: string) => {
    try {
      const response = await api.delete(`/EvoAI/delete/${instanceId}/${instanceName}`)
      
      //console.log(response.data)

      if (response.data) {
        return response.data
      }
      return null;
    } catch (error) {
      if (error instanceof Error) {
        //@ts-ignore
        console.error("Error creating Evolution Bot configuration:", error.response.data.response.message);
        //@ts-ignore
        return error.response.data.response.message
      } else {
        console.error("An unknown error occurred while creating Evolution Bot configuration");
      }
      return null;
    }
  };


export const fetchConnectionQRCode = async (instanceName: string) => {
  try {
    const response = await api.get(`/instance/connect/${instanceName}`)
    
    //console.log(response.data)

    if (response.data) {
      return response.data
    }
    return null;
  } catch (error) {
    if (error instanceof Error) {
      //@ts-ignore
      console.error("Error fetching connection QR code:", error.response.data.response.message);
      //@ts-ignore
      return error.response.data.response.message
    } else {
      console.error("An unknown error occurred while fetching connection QR code");
    }
    return null;
  }
};


export const checkConnectionQRCode = async (instanceName: string) => {
  try {
    const response = await api.get(`/instance/connectionState/${instanceName}`)
    
    //console.log(response.data)

    if (response.data) {
      return response.data
    }
    return null;
  } catch (error) {
    if (error instanceof Error) {
      //@ts-ignore
      console.error("Error checking connection QR code:", error.response.data.response.message);
      //@ts-ignore
      return error.response.data.response.message
    } else {
      console.error("An unknown error occurred while checking connection QR code");
    }
    return null;
  }
};