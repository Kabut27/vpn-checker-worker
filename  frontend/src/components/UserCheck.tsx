"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Progress,
  Chip,
  Spinner,
} from "@heroui/react";
import { Search, Wifi, Calendar, ArrowUpDown } from "lucide-react";
import { formatBytes, formatExpiry, getExpiryDate, API_URL } from "@/lib/3xui";

export default function UserCheck() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!email.trim()) return;
    
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`${API_URL}/api/traffic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), action: "getClientTraffic" }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to fetch data");
      }

      if (result.obj && result.obj.length > 0) {
        setData(result.obj[0]);
      } else {
        setError("ID hii haipo kwenye mfumo");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = () => {
    if (!data || data.total === 0) return 0;
    const used = data.up + data.down;
    return Math.min((used / data.total) * 100, 100);
  };

  const getStatusColor = () => {
    if (!data) return "default";
    if (!data.enable) return "danger";
    const used = data.up + data.down;
    if (data.total > 0 && used >= data.total) return "danger";
    if (data.expiryTime > 0 && data.expiryTime < Date.now()) return "danger";
    return "success";
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card className="bg-neutral-900 border-neutral-800">
        <CardBody className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Angalia Matumizi</h2>
            <p className="text-neutral-400 text-sm">
              Weka ID yako kuona matumizi ya data
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Weka ID (Email)..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              className="flex-1"
              size="lg"
              variant="bordered"
            />
            <Button
              color="primary"
              size="lg"
              onPress={handleCheck}
              isLoading={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {loading ? <Spinner size="sm" /> : <Search size={20} />}
            </Button>
          </div>

          {error && (
            <Chip color="danger" variant="flat" className="w-full">
              {error}
            </Chip>
          )}
        </CardBody>
      </Card>

      {data && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardBody className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi size={20} className="text-blue-500" />
                <span className="font-semibold">{data.email}</span>
              </div>
              <Chip
                color={getStatusColor()}
                variant="flat"
                size="sm"
              >
                {data.enable ? "Active" : "Disabled"}
              </Chip>
            </div>

            {data.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Matumizi ya Data</span>
                  <span className="text-white font-medium">
                    {formatBytes(data.up + data.down)} / {formatBytes(data.total)}
                  </span>
                </div>
                <Progress
                  value={getUsagePercentage()}
                  color={getUsagePercentage() > 90 ? "danger" : "primary"}
                  className="h-3"
                  showValueLabel
                />
                <div className="flex justify-between text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <ArrowUpDown size={12} />
                    Up: {formatBytes(data.up)}
                  </span>
                  <span>Down: {formatBytes(data.down)}</span>
                </div>
              </div>
            )}

            {data.expiryTime > 0 && (
              <div className="space-y-2 p-4 bg-neutral-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Calendar size={16} />
                  <span className="text-sm">Muda uliobaki</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatExpiry(data.expiryTime)}
                </div>
                <div className="text-xs text-neutral-500">
                  Inaisha: {getExpiryDate(data.expiryTime)}
                </div>
              </div>
            )}

            {data.total === 0 && data.expiryTime === 0 && (
              <div className="text-center text-neutral-400 py-4">
                Huna kikomo cha data wala muda
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
