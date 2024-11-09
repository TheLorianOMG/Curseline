import { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, DollarSign, TrendingUp, Timer, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57'];

const MultiJobCalculator = () => {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      name: 'Trabajo Principal',
      hourlyRate: 7,
      hoursPerDay: 4,
      daysPerWeek: 2,
      color: COLORS[0]
    }
  ]);

  const [expenses, setExpenses] = useState([
    { id: 1, name: 'Smartwatch', amount: 70, purchased: false },
    { id: 2, name: 'Teléfono', amount: 65, purchased: false },
    { id: 3, name: 'Medicinas', amount: 108, purchased: false },
    { id: 4, name: 'Misceláneos', amount: 30, purchased: false },
  ]);

  const [newJobName, setNewJobName] = useState('');
  const [newJobRate, setNewJobRate] = useState('');
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [historicalData, setHistoricalData] = useState([]);
  /* @ts-ignore */
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');

  // Cálculos de ganancias
  const calculateEarnings = (job) => {
    const daily = job.hourlyRate * job.hoursPerDay;
    const weekly = daily * job.daysPerWeek;
    const monthly = weekly * 4.3;
    return { daily, weekly, monthly };
  };

  const totalMonthlyEarnings = jobs.reduce((sum, job) => {
    return sum + (calculateEarnings(job).monthly);
  }, 0);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  useEffect(() => {
    // Generar datos históricos simulados
    const generateHistoricalData = () => {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return Array.from({ length: 12 }, (_, i) => ({
        name: months[i],
        total: totalMonthlyEarnings * (0.9 + Math.random() * 0.2),
        ...jobs.reduce((acc, job) => ({
          ...acc,
          [job.name]: calculateEarnings(job).monthly * (0.9 + Math.random() * 0.2)
        }), {})
      }));
    };

    setHistoricalData(generateHistoricalData());
  }, [jobs, totalMonthlyEarnings]);

  const addJob = () => {
    if (newJobName && newJobRate) {
      setJobs([...jobs, {
        id: Date.now(),
        name: newJobName,
        hourlyRate: Number(newJobRate),
        hoursPerDay: 4,
        daysPerWeek: 2,
        color: COLORS[jobs.length % COLORS.length]
      }]);
      setNewJobName('');
      setNewJobRate('');
    }
  };

  const removeJob = (id) => {
    setJobs(jobs.filter(job => job.id !== id));
  };

  const updateJob = (id, field, value) => {
    setJobs(jobs.map(job =>
      job.id === id ? { ...job, [field]: field === 'hourlyRate' ? Number(value) : value } : job
    ));
  };

  const addExpense = () => {
    if (newExpenseName && newExpenseAmount) {
      setExpenses([...expenses, {
        id: Date.now(),
        name: newExpenseName,
        amount: Number(newExpenseAmount),
        purchased: false
      }]);
      setNewExpenseName('');
      setNewExpenseAmount('');
    }
  };

  const removeExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const toggleExpensePurchased = (id) => {
    setExpenses(expenses.map(expense =>
      expense.id === id ? { ...expense, purchased: !expense.purchased } : expense
    ));
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Calculadora Multi-trabajo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="mr-2" />
              Trabajos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Nombre del trabajo"
                  value={newJobName}
                  onChange={(e) => setNewJobName(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="$/hora"
                  value={newJobRate}
                  onChange={(e) => setNewJobRate(e.target.value)}
                />
                <Button onClick={addJob}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Agregar
                </Button>
              </div>

              {jobs.map((job) => (
                <div key={job.id} className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{job.name}</h3>
                    <Button variant="destructive" size="sm" onClick={() => removeJob(job.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <Label>Salario por hora ($)</Label>
                      <Input
                        type="number"
                        value={job.hourlyRate}
                        onChange={(e) => updateJob(job.id, 'hourlyRate', e.target.value)}
                        min={1}
                      />
                    </div>
                    <div>
                      <Label>Horas por día</Label>
                      <Slider
                        value={[job.hoursPerDay]}
                        onValueChange={([value]) => updateJob(job.id, 'hoursPerDay', value)}
                        min={1}
                        max={24}
                        step={0.5}
                      />
                      <span>{job.hoursPerDay}h</span>
                    </div>
                    <div>
                      <Label>Días por semana</Label>
                      <Slider
                        value={[job.daysPerWeek]}
                        onValueChange={([value]) => updateJob(job.id, 'daysPerWeek', value)}
                        min={1}
                        max={7}
                        step={1}
                      />
                      <span>{job.daysPerWeek}d</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2" />
              Resumen de Ganancias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.map((job) => {
                const earnings = calculateEarnings(job);
                return (
                  <div key={job.id} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">{job.name}</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Diario</p>
                        <p className="font-semibold">${earnings.daily.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Semanal</p>
                        <p className="font-semibold">${earnings.weekly.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Mensual</p>
                        <p className="font-semibold">${earnings.monthly.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Total Mensual</h3>
                <p className="text-2xl font-bold">${totalMonthlyEarnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2" />
              Análisis de Ganancias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer>
                <AreaChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {jobs.map((job) => (
                    <Area
                      key={job.id}
                      type="monotone"
                      dataKey={job.name}
                      stackId="1"
                      stroke={job.color}
                      fill={job.color}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Timer className="mr-2" />
              Tiempo para Compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenses.map((expense) => {
                const weeksToAchieve = expense.amount / (totalMonthlyEarnings / 4);
                return (
                  <div key={expense.id} className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={expense.purchased}
                      onChange={() => toggleExpensePurchased(expense.id)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className={expense.purchased ? 'line-through' : ''}>
                          {expense.name} (${expense.amount})
                        </span>
                        <span className="text-sm text-gray-600">
                          {weeksToAchieve.toFixed(1)} semanas
                        </span>
                      </div>
                      <Progress
                        value={(totalMonthlyEarnings / expense.amount) * 25}
                        className="h-2"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}

              <div className="flex gap-2 mt-4">
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribución de Gastos vs Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Gastos', value: totalExpenses },
                    { name: 'Restante', value: Math.max(0, totalMonthlyEarnings - totalExpenses) }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#FF8042" />
                  <Cell fill="#00C49F" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiJobCalculator;