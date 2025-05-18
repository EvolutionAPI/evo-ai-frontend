/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Diwberg de Andrade Pereira                                                     │
│ @file: /whatsapp-instances/loading.tsx                                               │
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

import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

export default function WhatsAppInstancesLoading() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-10 w-64 bg-[#222]" />
          <Skeleton className="h-5 w-96 mt-2 bg-[#222]" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 bg-[#222]" />
          <Skeleton className="h-10 w-40 bg-[#222]" />
        </div>
      </div>
      
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-[#00ff9d]" />
          <p className="text-gray-400">Loading instances...</p>
        </div>
      </div>
    </div>
  );
}