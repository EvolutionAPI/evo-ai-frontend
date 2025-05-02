"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  ArrowLeft,
  Loader2,
  X,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listAgents } from "@/services/agentService";
import {
  listSessions,
  getSessionMessages,
  sendMessage,
  generateContactId,
  ChatSession,
  ChatMessage,
} from "@/services/sessionService";

export default function Chat() {
  const [isLoading, setIsLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [agentSearchTerm, setAgentSearchTerm] = useState("");
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>("all");
  const [messageInput, setMessageInput] = useState("");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [showAgentFilter, setShowAgentFilter] = useState(false);
  const { toast } = useToast();

  // Buscar ID do cliente do localStorage
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};
  const clientId = user?.client_id || "teste"; // Fallback para teste

  // Carregar agentes e sessões ao iniciar
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Carregar agentes
        const agentsResponse = await listAgents(clientId);
        setAgents(agentsResponse.data);

        // Carregar sessões
        const sessionsResponse = await listSessions(clientId);
        setSessions(sessionsResponse.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [clientId]);

  // Carregar mensagens quando uma sessão é selecionada
  useEffect(() => {
    if (!selectedSession) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const response = await getSessionMessages(selectedSession);
        setMessages(response.data);

        // Extrair o ID do agente do ID da sessão
        const agentId = selectedSession.split("_")[1];
        setCurrentAgentId(agentId);
      } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [selectedSession]);

  // Filtrar sessões por termo de busca e agente selecionado
  const filteredSessions = sessions.filter((session) => {
    const matchesSearchTerm = session.id
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Se o filtro de agente for "all", retorna todas as sessões que correspondem ao termo de busca
    if (selectedAgentFilter === "all") {
      return matchesSearchTerm;
    }

    // Caso contrário, filtra também pelo agente selecionado
    const sessionAgentId = session.id.split("_")[1];
    return matchesSearchTerm && sessionAgentId === selectedAgentFilter;
  });

  // Ordenar por data de atualização (mais recentes primeiro)
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    // Usar campo update_time para ordenação
    const updateTimeA = new Date(a.update_time).getTime();
    const updateTimeB = new Date(b.update_time).getTime();

    return updateTimeB - updateTimeA;
  });

  // Função para formatar a data/hora
  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);

      // Formatar como "DD/MM/YYYY HH:MM"
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return "Data inválida";
    }
  };

  // Filtrar agentes por termo de busca
  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(agentSearchTerm.toLowerCase()) ||
      (agent.description &&
        agent.description.toLowerCase().includes(agentSearchTerm.toLowerCase()))
  );

  // Selecionar agente para nova conversa
  const selectAgent = (agentId: string) => {
    setCurrentAgentId(agentId);
    setSelectedSession(null); // Limpar sessão atual
    setMessages([]); // Limpar mensagens
    setIsNewChatDialogOpen(false); // Fechar diálogo
  };

  // Enviar mensagem
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !currentAgentId) return;

    try {
      setIsSending(true);

      // Se não houver sessão selecionada, criar uma nova sessão implicitamente
      if (!selectedSession) {
        const contactId = generateContactId();
        const newSessionId = `${contactId}_${currentAgentId}`;
        setSelectedSession(newSessionId);
      }

      // Adicionar mensagem localmente para feedback imediato
      const tempMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        content: {
          parts: [{ text: messageInput }],
          role: "user",
        },
        author: "user",
        timestamp: Date.now() / 1000,
      };

      setMessages((prev) => [...prev, tempMessage]);

      // Enviar para a API
      const sessionId =
        selectedSession || `${generateContactId()}_${currentAgentId}`;
      const response = await sendMessage(
        sessionId,
        currentAgentId,
        messageInput
      );

      // Processar resposta diretamente
      if (response.data && response.data.response) {
        // Criar objeto de mensagem para a resposta do agente
        const agentMessage: ChatMessage = {
          id: `response-${Date.now()}`,
          content: {
            parts: [{ text: response.data.response }],
            role: "assistant",
          },
          author: currentAgent?.name || "Assistente",
          timestamp: Date.now() / 1000,
        };

        // Adicionar a resposta às mensagens
        setMessages((prev) => [...prev, agentMessage]);

        // Atualizar a lista de sessões
        const sessionsResponse = await listSessions(clientId);
        setSessions(sessionsResponse.data);
      } else {
        // Fallback: buscar todas as mensagens da sessão
        const messagesResponse = await getSessionMessages(sessionId);
        setMessages(messagesResponse.data);
      }

      // Limpar input
      setMessageInput("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro ao enviar mensagem",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Encontrar informações do agente atual
  const currentAgent = agents.find((agent) => agent.id === currentAgentId);

  // Extrair informações da sessão atual
  const getCurrentSessionInfo = () => {
    if (!selectedSession) return null;

    // O formato do sessionId é contactId_agentId
    const parts = selectedSession.split("_");

    try {
      // Tentar extrair data do contactId se estiver no formato correto (YYYYMMDD_HHMMSS)
      const dateStr = parts[0];
      if (dateStr.length >= 8) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);

        return {
          contactId: parts[0],
          agentId: parts[1],
          displayDate: `${day}/${month}/${year}`,
        };
      }
    } catch (e) {
      console.error("Erro ao processar ID da sessão:", e);
    }

    return {
      contactId: parts[0],
      agentId: parts[1],
      displayDate: "Sessão",
    };
  };

  // Extrair contactId de um ID de sessão
  const getContactId = (sessionId: string) => {
    return sessionId.split("_")[0];
  };

  // Função para interpretar o conteúdo da mensagem
  const getMessageText = (message: ChatMessage) => {
    const parts = message.content.parts;

    if (!parts || parts.length === 0) return "Conteúdo vazio";

    // Verificar se há texto direto
    if (parts[0].text) return parts[0].text;

    // Verificar se há function call (pensamento sequencial)
    if (
      parts[0].functionCall &&
      parts[0].functionCall.args &&
      parts[0].functionCall.args.thought
    ) {
      return parts[0].functionCall.args.thought;
    }

    // Fallback
    return JSON.stringify(parts);
  };

  // Cores para agentes - mapeamento por nome
  const agentColors: Record<string, string> = {
    Assistente: "bg-[#00ff9d]",
    Programador: "bg-[#00cc7d]",
    Redator: "bg-[#00b8ff]",
    Pesquisador: "bg-[#ff9d00]",
    Planejador: "bg-[#9d00ff]",
    default: "bg-[#333]",
  };

  const getAgentColor = (agentName: string) => {
    return agentColors[agentName] || agentColors.default;
  };

  return (
    <div className="flex h-screen max-h-screen bg-[#121212]">
      {/* Sidebar - Lista de sessões de chat */}
      <div className="w-80 border-r border-[#333] flex flex-col bg-[#1a1a1a]">
        <div className="p-4 border-b border-[#333]">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => setIsNewChatDialogOpen(true)}
              className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" /> Nova Conversa
            </Button>
          </div>

          {/* Busca e Filtros */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar conversas..."
                className="pl-8 bg-[#222] border-[#444] text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-[#333]"
                onClick={() => setShowAgentFilter(!showAgentFilter)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filtrar
              </Button>

              {selectedAgentFilter !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAgentFilter("all")}
                  className="text-gray-400 hover:text-white hover:bg-[#333]"
                >
                  Limpar filtro
                </Button>
              )}
            </div>

            {showAgentFilter && (
              <div className="pt-1">
                <Select
                  value={selectedAgentFilter}
                  onValueChange={setSelectedAgentFilter}
                >
                  <SelectTrigger className="bg-[#222] border-[#444] text-white">
                    <SelectValue placeholder="Filtrar por agente" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#222] border-[#444] text-white">
                    <SelectItem
                      value="all"
                      className="data-[selected]:bg-[#333] data-[highlighted]:bg-[#333] !text-white hover:text-[#00ff9d] data-[selected]:!text-[#00ff9d]"
                    >
                      Todos os agentes
                    </SelectItem>
                    {agents.map((agent) => (
                      <SelectItem
                        key={agent.id}
                        value={agent.id}
                        className="data-[selected]:bg-[#333] data-[highlighted]:bg-[#333] !text-white hover:text-[#00ff9d] data-[selected]:!text-[#00ff9d]"
                      >
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Lista de sessões */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-5 w-5 text-[#00ff9d] animate-spin" />
            </div>
          ) : sortedSessions.length > 0 ? (
            <div className="divide-y divide-[#333]">
              {sortedSessions.map((session) => {
                // Extrair ID do agente do ID da sessão
                const agentId = session.id.split("_")[1];
                const agentInfo = agents.find((a) => a.id === agentId);
                const contactId = getContactId(session.id);

                return (
                  <div
                    key={session.id}
                    className={`p-3 hover:bg-[#222] cursor-pointer ${
                      selectedSession === session.id ? "bg-[#2a2a2a]" : ""
                    }`}
                    onClick={() => setSelectedSession(session.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-[#00ff9d] mr-2"></div>
                        <div className="text-white font-medium truncate max-w-[200px]">
                          {contactId}
                        </div>
                      </div>
                      {agentInfo && (
                        <Badge className="bg-[#333] text-[#00ff9d] border-none text-xs">
                          {agentInfo.name}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1">
                      <div className="text-xs text-gray-500">
                        {formatDateTime(session.update_time)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : searchTerm || selectedAgentFilter !== "all" ? (
            <div className="p-4 text-center text-gray-400">
              Nenhum resultado encontrado
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">
              Clique em "Nova" para iniciar
            </div>
          )}
        </div>
      </div>

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col">
        {selectedSession || currentAgentId ? (
          <>
            {/* Cabeçalho */}
            <div className="p-4 border-b border-[#333] bg-[#1a1a1a]">
              {/* Extrair informações da sessão atual */}
              {(() => {
                const sessionInfo = getCurrentSessionInfo();

                return (
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-[#00ff9d]" />
                      {selectedSession
                        ? `Sessão ${sessionInfo?.contactId || selectedSession}`
                        : "Nova Conversa"}
                    </h2>

                    {currentAgent && (
                      <Badge className="bg-[#00ff9d] text-black px-3 py-1 text-sm">
                        {currentAgent.name || currentAgentId}
                      </Badge>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#121212]">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-6 w-6 text-[#00ff9d] animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center text-gray-400">
                  <p>
                    Nenhuma mensagem nesta conversa. Comece digitando abaixo.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isUser = message.author === "user";
                    const agentColor = getAgentColor(message.author);
                    const messageText = getMessageText(message);

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex gap-3 max-w-[80%] ${
                            isUser ? "flex-row-reverse" : ""
                          }`}
                        >
                          <Avatar className={isUser ? "bg-[#333]" : agentColor}>
                            <AvatarFallback>
                              {isUser ? "U" : message.author[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`rounded-lg p-3 ${
                              isUser
                                ? "bg-[#00ff9d] text-black"
                                : "bg-[#222] text-white"
                            }`}
                          >
                            {messageText}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Indicador de digitação */}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[80%]">
                        <Avatar
                          className={
                            currentAgent
                              ? getAgentColor(currentAgent.name)
                              : "bg-[#00ff9d]"
                          }
                        >
                          <AvatarFallback>
                            {currentAgent?.name?.[0] || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg p-3 bg-[#222]">
                          <div className="flex space-x-2">
                            <div className="h-2 w-2 rounded-full bg-[#00ff9d] animate-bounce"></div>
                            <div className="h-2 w-2 rounded-full bg-[#00ff9d] animate-bounce [animation-delay:0.2s]"></div>
                            <div className="h-2 w-2 rounded-full bg-[#00ff9d] animate-bounce [animation-delay:0.4s]"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Área de entrada de mensagem */}
            <div className="p-4 border-t border-[#333] bg-[#1a1a1a]">
              <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-[#222] border-[#444] text-white focus-visible:ring-[#00ff9d]"
                  disabled={isSending || isLoading}
                />
                <Button
                  type="submit"
                  disabled={
                    isSending ||
                    isLoading ||
                    !messageInput.trim() ||
                    !currentAgentId
                  }
                  className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-16 w-16 text-[#00ff9d] mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-3">
              Selecione uma conversa
            </h2>
            <p className="text-gray-400 mb-6 max-w-md">
              Escolha uma conversa existente ou inicie uma nova.
            </p>
            <Button
              onClick={() => setIsNewChatDialogOpen(true)}
              className="bg-[#00ff9d] text-black hover:bg-[#00cc7d] px-6 py-2"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nova Conversa
            </Button>
          </div>
        )}
      </div>

      {/* Modal para criar nova conversa */}
      <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#333] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              Nova Conversa
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Selecione um agente para iniciar uma nova conversa.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* Campo de busca para agentes */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar agentes..."
                className="pl-8 bg-[#222] border-[#444] text-white"
                value={agentSearchTerm}
                onChange={(e) => setAgentSearchTerm(e.target.value)}
              />
            </div>

            <div className="text-sm text-gray-300 mb-2">Escolha um agente:</div>

            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="col-span-2 flex justify-center py-4">
                  <Loader2 className="h-6 w-6 text-[#00ff9d] animate-spin" />
                </div>
              ) : filteredAgents.length > 0 ? (
                filteredAgents.map((agent) => (
                  <Button
                    key={agent.id}
                    onClick={() => selectAgent(agent.id)}
                    className="bg-[#222] hover:bg-[#333] text-white justify-start"
                    disabled={isLoading}
                  >
                    <div className="flex flex-col items-start text-left">
                      <div className="font-medium">
                        {agent.name || agent.id}
                      </div>
                      {agent.description && (
                        <div className="text-xs text-gray-400 truncate w-full">
                          {agent.description}
                        </div>
                      )}
                    </div>
                  </Button>
                ))
              ) : agentSearchTerm ? (
                <div className="col-span-2 text-center py-4 text-gray-400">
                  Nenhum agente encontrado com "{agentSearchTerm}"
                </div>
              ) : (
                <div className="col-span-2 text-center py-4 text-gray-400">
                  Nenhum agente disponível
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsNewChatDialogOpen(false)}
              variant="outline"
              className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333]"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
