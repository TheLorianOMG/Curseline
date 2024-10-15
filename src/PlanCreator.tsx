import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const tags = [
  'Estratégia', 'Matemática', 'Marketing', 'Vendas', 'Desenvolvimento', 'Design',
  'Pesquisa', 'Análise', 'Finanças', 'Recursos Humanos', 'Operações', 'Logística',
  'Tecnologia', 'Inovação', 'Planejamento', 'Comunicação', 'Gestão de Projetos',
  'Qualidade', 'Atendimento ao Cliente', 'Legal', 'Sustentabilidade', 'Treinamento',
  'Produção', 'Compras', 'Parcerias', 'Relações Públicas', 'Segurança', 'Compliance',
  'Gestão de Riscos', 'Internacionalização'
];

const PlanCreator = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState(['Produto', 'Marketing', 'Vendas']);
  const [newTask, setNewTask] = useState({ title: '', category: '', date: '', tag: '' });

  useEffect(() => {
    const savedData = localStorage.getItem('planCreatorData');
    if (savedData) {
      const { tasks, categories } = JSON.parse(savedData);
      setTasks(tasks);
      setCategories(categories);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('planCreatorData', JSON.stringify({ tasks, categories }));
  }, [tasks, categories]);

  const addTask = () => {
    if (newTask.title && newTask.category) {
      setTasks([...tasks, { ...newTask, id: Date.now().toString() }]);
      setNewTask({ title: '', category: '', date: '', tag: '' });
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTasks(items);
  };

  const addCategory = (category) => {
    if (category && !categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const deleteCategory = (category) => {
    setCategories(categories.filter(c => c !== category));
    setTasks(tasks.filter(task => task.category !== category));
  };

  const getTaskStats = () => {
    const stats = tags.map(tag => ({
      name: tag,
      count: tasks.filter(task => task.tag === tag).length
    }));
    return stats.filter(stat => stat.count > 0);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Plan Creator</h1>
      
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>Adicionar Tarefa</CardHeader>
          <CardContent>
            <Input
              placeholder="Título da tarefa"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              className="mb-2"
            />
            <Select
              value={newTask.category}
              //@ts-ignore
              onChange={(e) => setNewTask({...newTask, category: e.target.value})}
              className="mb-2"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
            <Input
              type="date"
              value={newTask.date}
              onChange={(e) => setNewTask({...newTask, date: e.target.value})}
              className="mb-2"
            />
            <Select
              value={newTask.tag}              //@ts-ignore

              onChange={(e) => setNewTask({...newTask, tag: e.target.value})}
              className="mb-2"
            >
              {tags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </Select>
            <Button onClick={addTask}>Adicionar Tarefa</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Categorias</CardHeader>
          <CardContent>
            {categories.map(category => (
              <div key={category} className="flex justify-between items-center mb-2">
                <span>{category}</span>
                <Button onClick={() => deleteCategory(category)} variant="destructive" size="sm">Excluir</Button>
              </div>
            ))}
            <Input
              placeholder="Nova categoria"              //@ts-ignore

              onKeyPress={(e) => e.key === 'Enter' && addCategory(e.target.value)}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Estatísticas de Tarefas</CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={getTaskStats()}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>Cronograma de Tarefas</CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef}>
                  {tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-2 mb-2 rounded shadow"
                        >
                          <div className="flex justify-between items-center">
                            <span>{task.title}</span>
                            <div>
                              <span className="mr-2">{task.category}</span>
                              <span className="mr-2">{task.date}</span>
                              <span className="mr-2">{task.tag}</span>
                              <Button onClick={() => deleteTask(task.id)} variant="destructive" size="sm">Excluir</Button>
                            </div>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanCreator;