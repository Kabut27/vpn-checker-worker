"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Input,
  Spinner,
} from "@heroui/react";
import {
  Users,
  Search,
  RefreshCw,
  ArrowUpDown,
  Wifi,
  AlertCircle,
} from "lucide-react";
import { formatBytes, formatExpiry, API_URL } from "@/lib/3xui";

export default function AdminDashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchAllClients = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/traffic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "listInbounds", email: "" }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      const allClients: any[] = [];
      
      if (data.obj) {
        for (const inbound of data.obj) {
          try {
            const settings = JSON.parse(inbound.settings);
            if (settings.clients) {
              for (const client of settings.clients) {
                const trafficRes = await fetch(`${API_URL}/api/traffic`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "getClientTraffic",
                    email: client.email,
                  }),
                });
                
                const trafficData = await trafficRes.json();
                const traffic = trafficData.obj?.[0] || {};

                allClients.push({
                  ...client,
                  inboundId: inbound.id,
                  protocol: inbound.protocol,
                  port: inbound.port,
                  up: traffic.up || 0,
                  down: traffic.down || 0,
                  total: traffic.total || 0,
                  expiryTime: traffic.expiryTime || 0,
                  enable: traffic.enable ?? true,
                });
              }
            }
          } catch (e) {
            console.error("Error parsing inbound:", e);
          }
        }
      }

      setClients(allClients);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllClients();
  }, []);

  const filteredClients = clients.filter((c) =>
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (client: any) => {
    if (!client.enable) return { color: "danger" as const, text: "Disabled" };
    const used = client.up + client.down;
    if (client.total > 0 && used >= client.total) return { color: "danger" as const, text: "Expired" };
    if (client.expiryTime > 0 && client.expiryTime < Date.now()) return { color: "danger" as const, text: "Expired" };
    return { color: "success" as const, text: "Active" };
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-neutral-400 text-sm">
                Wateja wote: {clients.length}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Tafuta client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startContent={<Search size={18} className="text-neutral-500" />}
              className="w-64"
              variant="bordered"
            />
            <Button
              isIconOnly
              variant="bordered"
              onPress={fetchAllClients}
              isLoading={loading}
            >
              <RefreshCw size={18} />
            </Button>
          </div>
        </div>

        {error && (
          <Card className="bg-danger-900/20 border-danger-500/50">
            <CardBody className="flex items-center gap-2 text-danger-400">
              <AlertCircle size={18} />
              {error}
            </CardBody>
          </Card>
        )}

        <Card className="bg-neutral-900 border-neutral-800">
          <CardBody>
            <Table
              aria-label="Clients table"
              classNames={{
                wrapper: "bg-transparent",
                th: "bg-neutral-800 text-neutral-300",
                td: "text-neutral-300",
              }}
            >
              <TableHeader>
                <TableColumn>EMAIL/ID</TableColumn>
                <TableColumn>PROTOCOL</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>DATA USAGE</TableColumn>
                <TableColumn>TIME LEFT</TableColumn>
                <TableColumn>PORT</TableColumn>
              </TableHeader>
              <TableBody
                items={filteredClients}
                emptyContent={
                  loading ? (
                    <div className="flex justify-center py-8">
                      <Spinner size="lg" />
                    </div>
                  ) : (
                    "Hakuna clients"
                  )
                }
              >
                {(client) => {
                  const status = getStatus(client);
                  const used = client.up + client.down;
                  const percentage =
                    client.total > 0 ? (used / client.total) * 100 : 0;

                  return (
                    <TableRow key={client.email}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Wifi size={14} className="text-blue-500" />
                          <span className="font-medium text-white">
                            {client.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="primary">
                          {client.protocol?.toUpperCase()}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={status.color}
                        >
                          {status.text}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {formatBytes(used)} / {formatBytes(client.total)}
                          </div>
                          {client.total > 0 && (
                            <div className="w-24 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  percentage > 90
                                    ? "bg-red-500"
                                    : percentage > 70
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.expiryTime > 0 ? (
                          <span
                            className={
                              client.expiryTime < Date.now()
                                ? "text-red-400"
                                : "text-green-400"
                            }
                          >
                            {formatExpiry(client.expiryTime)}
                          </span>
                        ) : (
                          <span className="text-neutral-500">Unlimited</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-neutral-400">{client.port}</span>
                      </TableCell>
                    </TableRow>
                  );
                }}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
