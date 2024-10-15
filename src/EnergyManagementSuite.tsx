import React, { useState, useEffect } from 'react';
import { Calculator, PlusCircle, Trash2, TrendingUp, BarChart2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const EnergyManagementSuite = () => {
  const [devices, setDevices] = useState([]);
  const [newDevice, setNewDevice] = useState({ name: '', watts: '', usage: '24', usageType: 'hours' });
  const [totalConsumption, setTotalConsumption] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [electricityRate, setElectricityRate] = useState(0.1732); // €/kWh
  const [consumptionHistory, setConsumptionHistory] = useState([]);

  useEffect(() => {
    calculateConsumption();
  }, [devices, electricityRate]);

  const addDevice = () => {
    if (newDevice.name && newDevice.watts && newDevice.usage) {
      setDevices([...devices, { ...newDevice, id: Date.now() }]);
      setNewDevice({ name: '', watts: '', usage: '24', usageType: 'hours' });
    }
  };

  const removeDevice = (id) => {
    setDevices(devices.filter(device => device.id !== id));
  };

  const calculateConsumption = () => {
    let totalKWh = 0;              //@ts-ignore

    const deviceConsumptions = devices.map(device => {
      let hoursPerMonth = device.usage;
      if (device.usageType === 'days') {
        hoursPerMonth *= 24;
      }
      const kWh = (device.watts * hoursPerMonth) / 1000;
      totalKWh += kWh;
      return { ...device, consumption: kWh };
    });

    setTotalConsumption(totalKWh);
    setTotalCost(totalKWh * electricityRate);

    // Actualizar historial de consumo
    setConsumptionHistory(prev => [...prev, { month: new Date().toLocaleString('default', { month: 'long' }), consumption: totalKWh }].slice(-12));
  };

  const exportData = () => {
    const dataStr = JSON.stringify({ devices, consumptionHistory, electricityRate });
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'energy_data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <Calculator className="mr-2" />
          Suite de Gestión Energética
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calculator">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calculator">Calculadora</TabsTrigger>
            <TabsTrigger value="trends">Tendencias</TabsTrigger>
            <TabsTrigger value="comparison">Comparación</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="electricityRate">Tarifa Eléctrica (€/kWh)</Label>
                  <Input
                    id="electricityRate"
                    type="number"
                    value={electricityRate}
                    onChange={(e) => setElectricityRate(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-2">Agregar Nuevo Dispositivo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Nombre del dispositivo"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                  />
                  <Input
                    type="number"
                    placeholder="Watts"
                    value={newDevice.watts}
                    onChange={(e) => setNewDevice({...newDevice, watts: e.target.value})}
                  />
                  <Input
                    type="number"
                    placeholder="Tiempo de uso"
                    value={newDevice.usage}
                    onChange={(e) => setNewDevice({...newDevice, usage: e.target.value})}
                  />
                  <Select
                    value={newDevice.usageType}
                    onValueChange={(value) => setNewDevice({...newDevice, usageType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de uso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Horas por día</SelectItem>
                      <SelectItem value="days">Días por mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addDevice} className="mt-4 w-full">
                  <PlusCircle className="mr-2" /> Agregar Dispositivo
                </Button>
              </Card>

              {devices.map((device) => (
                <Card key={device.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">{device.name}</h4>
                    <Button variant="destructive" size="icon" onClick={() => removeDevice(device.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p>{device.watts} W, {device.usage} {device.usageType === 'hours' ? 'horas/día' : 'días/mes'}</p>
                </Card>
              ))}

              <Card className="p-4 mt-6">
                <h3 className="text-lg font-semibold mb-2">Resumen de Consumo</h3>
                <p>Consumo Total: {totalConsumption.toFixed(2)} kWh/mes</p>
                <p>Costo Mensual Estimado: {totalCost.toFixed(2)} €</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2">Tendencias de Consumo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={consumptionHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="consumption" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="comparison">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2">Comparación de Dispositivos</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={devices}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="watts" fill="#82ca9d" name="Potencia (W)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2">Recomendaciones de Ahorro</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Considera reemplazar los dispositivos de mayor consumo por modelos más eficientes.</li>
                <li>Optimiza el uso de los dispositivos durante las horas de menor tarifa eléctrica.</li>
                <li>Implementa sistemas de apagado automático para reducir el consumo en standby.</li>
                <li>Evalúa la posibilidad de instalar paneles solares para reducir la dependencia de la red eléctrica.</li>
              </ul>
            </Card>
          </TabsContent>
        </Tabs>

        <Button onClick={exportData} className="mt-4">
          <Download className="mr-2" /> Exportar Datos
        </Button>
      </CardContent>
    </Card>
  );
};

export default EnergyManagementSuite;