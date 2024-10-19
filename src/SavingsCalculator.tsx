import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57'];

const SavingsCalculator = () => {
  const [hourlyRate, setHourlyRate] = useState(7);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [expenses, setExpenses] = useState([
    { id: 1, name: 'Smartwatch', amount: 70 },
    { id: 2, name: 'Teléfono', amount: 65 },
    { id: 3, name: 'Medicinas', amount: 108 },
    { id: 4, name: 'Misceláneos', amount: 30 },
  ]);
  const [data, setData] = useState([]);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  const totalCost = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const dailyEarnings = hourlyRate * hoursPerDay;
  const weeklyEarnings = dailyEarnings * daysPerWeek;
  const monthlyEarnings = weeklyEarnings * 4.3;

  useEffect(() => {
    const weeksToGoal = Math.ceil(totalCost / weeklyEarnings);
    
    const newData = Array.from({ length: weeksToGoal }, (_, i) => ({
      semana: i + 1,
      ahorros: Math.min((i + 1) * weeklyEarnings, totalCost),
    }));
    
    setData(newData);
  }, [hourlyRate, hoursPerDay, daysPerWeek, totalCost, weeklyEarnings]);

  const addExpense = () => {
    if (newExpenseName && newExpenseAmount) {
      setExpenses([...expenses, { 
        id: Date.now(), 
        name: newExpenseName, 
        amount: Number(newExpenseAmount) 
      }]);
      setNewExpenseName('');
      setNewExpenseAmount('');
    }
  };

  const removeExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const updateExpense = (id, field, value) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, [field]: field === 'amount' ? Number(value) : value } : expense
    ));
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Calculadora de Ahorros Avanzada</h1>
      
      <Tabs defaultValue="calculator" className="mb-6">
        <TabsList>
          <TabsTrigger value="calculator">Calculadora</TabsTrigger>
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
        </TabsList>
        <TabsContent value="calculator">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="hourlyRate">Salario por hora ($)</Label>
              <Input
                id="hourlyRate"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                min={1}
              />
            </div>
            <div>
              <Label htmlFor="hoursPerDay">Horas por día</Label>
              <Slider
                id="hoursPerDay"
                value={[hoursPerDay]}
                onValueChange={([value]) => setHoursPerDay(value)}
                min={1}
                max={8}
                step={0.5}
              />
              <span>{hoursPerDay}</span>
            </div>
            <div>
              <Label htmlFor="daysPerWeek">Días por semana</Label>
              <Slider
                id="daysPerWeek"
                value={[daysPerWeek]}
                onValueChange={([value]) => setDaysPerWeek(value)}
                min={1}
                max={7}
                step={1}
              />
              <span>{daysPerWeek}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <h3 className="font-semibold">Ganancias diarias</h3>
              <p>${dailyEarnings.toFixed(2)}</p>
            </div>
            <div>
              <h3 className="font-semibold">Ganancias semanales</h3>
              <p>${weeklyEarnings.toFixed(2)}</p>
            </div>
            <div>
              <h3 className="font-semibold">Ganancias mensuales</h3>
              <p>${monthlyEarnings.toFixed(2)}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Progreso hacia la meta</h3>
            <Progress value={(weeklyEarnings / totalCost) * 100} className="w-full" />
          </div>

          <div className="h-80 w-full mb-6">
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semana" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ahorros" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        <TabsContent value="expenses">
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Agregar nuevo gasto</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Nombre del gasto"
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Monto"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
              />
              <Button onClick={addExpense}>
                <PlusCircle className="mr-2 h-4 w-4" /> Agregar
              </Button>
            </div>
          </div>
          <div className="grid gap-4 mb-6">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center gap-2">
                <Input
                  value={expense.name}
                  onChange={(e) => updateExpense(expense.id, 'name', e.target.value)}
                />
                <Input
                  type="number"
                  value={expense.amount}
                  onChange={(e) => updateExpense(expense.id, 'amount', e.target.value)}
                />
                <Button variant="destructive" onClick={() => removeExpense(expense.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={expenses}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {/* @ts-ignore */}
                  {expenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Resumen</h3>
        <p>
          Con tu configuración actual, necesitarás aproximadamente {data.length} semanas para alcanzar tu objetivo de ahorro de ${totalCost.toFixed(2)}.
        </p>
        <p className="mt-2">
          Consejo: Revisa tus gastos regularmente y busca áreas donde puedas reducir costos. Cada pequeño ahorro te acerca más rápido a tu meta.
        </p>
      </div>
    </div>
  );
};

export default SavingsCalculator;