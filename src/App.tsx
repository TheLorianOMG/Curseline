import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Trash2, Plus, Tag, Search, Home, BarChart, ChevronLeft, ChevronRight, Save, Upload, XCircle, Calendar, Zap, Orbit, Coins } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { Timeline, TimelineEvent } from 'react-event-timeline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Task {
  id: string;
  name: string;
  description: string;
  tags: string[];
  dueDate: string | null;
}

interface List {
  id: string;
  name: string;
  tasks: Task[];
}

const Alert: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
  <div className="bg-red-900 text-red-100 p-4 rounded-md flex justify-between items-center mb-4 shadow-lg">
    <div>{children}</div>
    <button onClick={onClose} className="ml-4 hover:text-red-300 transition-colors">
      <XCircle size={20} />
    </button>
  </div>
);

const INITIAL_LISTS: List[] = [
  { id: '1', name: 'Por hacer', tasks: [] },
  { id: '2', name: 'En progreso', tasks: [] },
  { id: '3', name: 'Completado', tasks: [] },
];

const CurselineToDo: React.FC = () => {
  const [lists, setLists] = useState<List[]>(() => {
    try {
      const savedLists = localStorage.getItem('curselineLists');
      return savedLists ? JSON.parse(savedLists) : INITIAL_LISTS;
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      return INITIAL_LISTS;
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeView, setActiveView] = useState('home');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('curselineLists', JSON.stringify(lists));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, [lists]);

  const saveData = () => {
    const data = localStorage.getItem('curselineLists');
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'curseline_data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            const importedData = JSON.parse(result);
            if (validateImportedData(importedData)) {
              setLists(importedData);
              setError('');
            } else {
              setError('El archivo JSON no tiene la estructura correcta.');
            }
          }
        } catch (error) {
          setError('El archivo no es un JSON válido.');
        }
      };
      reader.readAsText(file);
    }
  };

  const validateImportedData = (data: any): data is List[] => {
    if (!Array.isArray(data)) return false;
    return data.every(list =>
      typeof list === 'object' &&
      'id' in list &&
      'name' in list &&
      Array.isArray(list.tasks) &&
      list.tasks.every((task: any) =>
        typeof task === 'object' &&
        'id' in task &&
        'name' in task &&
        'description' in task &&
        Array.isArray(task.tags) &&
        (task.dueDate === null || typeof task.dueDate === 'string')
      )
    );
  };

  const updateLists = useCallback((updater: (list: List) => List) => {
    setLists(prevLists => prevLists.map(updater));
  }, []);

  const addTask = useCallback((listId: string) => {
    updateLists(list =>
      list.id === listId
        ? { ...list, tasks: [...list.tasks, { id: Date.now().toString(), name: 'Nueva tarea', description: '', tags: [], dueDate: null }] }
        : list
    );
  }, [updateLists]);

  const updateTask = useCallback((listId: string, taskId: string, updates: Partial<Task>) => {
    updateLists(list =>
      list.id === listId
        ? {
          ...list,
          tasks: list.tasks.map(task =>
            task.id === taskId
              ? { ...task, ...updates }
              : task
          )
        }
        : list
    );
  }, [updateLists]);

  const deleteTask = useCallback((listId: string, taskId: string) => {
    updateLists(list =>
      list.id === listId
        ? { ...list, tasks: list.tasks.filter(task => task.id !== taskId) }
        : list
    );
  }, [updateLists]);

  const addTag = useCallback((listId: string, taskId: string, newTag: string) => {
    if (newTag.trim()) {
      //@ts-ignore
      updateTask(listId, taskId, { tags: tags => [...(tags || []), newTag.trim()] });
    }
  }, [updateTask]);

  const deleteTag = useCallback((listId: string, taskId: string, tagToDelete: string) => {
    //@ts-ignore
    updateTask(listId, taskId, { tags: tags => (tags || []).filter(tag => tag !== tagToDelete) });
  }, [updateTask]);

  const moveTask = useCallback((taskId: string, sourceListId: string, direction: 'left' | 'right') => {
    setLists(prevLists => {
      const newLists = JSON.parse(JSON.stringify(prevLists));
      const sourceListIndex = newLists.findIndex((list: List) => list.id === sourceListId);
      const destListIndex = direction === 'right' ? sourceListIndex + 1 : sourceListIndex - 1;

      if (destListIndex < 0 || destListIndex >= newLists.length) return prevLists;

      const sourceList = newLists[sourceListIndex];
      const destList = newLists[destListIndex];
      const taskIndex = sourceList.tasks.findIndex((task: Task) => task.id === taskId);

      if (taskIndex === -1) return prevLists;

      const [movedTask] = sourceList.tasks.splice(taskIndex, 1);
      destList.tasks.push(movedTask);

      return newLists;
    });
  }, []);

  const filteredTasks = useMemo(() =>
    lists.flatMap(list =>
      list.tasks.filter(task =>
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedTags.length === 0 || selectedTags.some(tag => task.tags.includes(tag)))
      ).map(task => ({ ...task, listId: list.id }))
    ),
    [lists, searchTerm, selectedTags]
  );

  const allTags = useMemo(() =>
    Array.from(new Set(lists.flatMap(list => list.tasks.flatMap(task => task.tags)))),
    [lists]
  );

  const taskStats = useMemo(() =>
    lists.map(list => ({ name: list.name, tasks: list.tasks.length })),
    [lists]
  );

  const completionStats = useMemo(() => [
    {
      name: 'Estado', Completadas: lists.find(list => list.name === 'Completado')?.tasks.length || 0,
      Pendientes: lists.filter(list => list.name !== 'Completado').reduce((acc, list) => acc + list.tasks.length, 0)
    }
  ], [lists]);

  const sortedTasksWithDates = useMemo(() => {
    return lists
      .flatMap(list => list.tasks.map(task => ({ ...task, listName: list.name })))
      .filter(task => task.dueDate)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }, [lists]);

  const timelineData = useMemo(() => {
    const today = new Date();
    return sortedTasksWithDates.map(task => ({
      ...task,
      isOverdue: new Date(task.dueDate!) < today
    }));
  }, [sortedTasksWithDates]);

  const renderTimeline = () => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-100">Línea de Tiempo de Tareas</h2>
      <Timeline>
      {timelineData.map(task => (
        <TimelineEvent
        key={task.id}
        title={
          <span style={{ color: '#E5E7EB', fontSize: '1.1em' }}>{task.name}</span>
        }
        createdAt={
          <span style={{ color: '#9CA3AF' }}>{new Date(task.dueDate!).toLocaleDateString()}</span>
        }
        icon={<Calendar />}
        iconColor={task.isOverdue ? "#EF4B45" : "#45EFAB"}
        bubbleStyle={{
          borderColor: task.isOverdue ? "#EF4B45" : "#45EFAB",
        }}
        contentStyle={{
          backgroundColor: 'rgba(75, 85, 99, 0.3)',
          boxShadow: 'none',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '1rem',
        }}
        className="custom-timeline-event"
      >
        <p className="text-gray-300">{task.description}</p>
        <p className="text-gray-400 mt-2">Lista: {task.listName}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {task.tags.map((tag, index) => (
            <span key={index} className="bg-purple-700 px-2 py-1 rounded text-sm text-purple-100">
              {tag}
            </span>
          ))}
        </div>
      </TimelineEvent>
      ))}
    </Timeline>
    </div>
  );

  const renderTask = useCallback((task: Task & { listId: string }, listIndex: number) => (
    <div key={task.id} className="bg-gray-700 p-4 rounded-lg mb-4 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-center mb-2">
        <input
          className="bg-transparent border-b border-gray-500 flex-grow mr-2 text-lg text-gray-100 focus:outline-none focus:border-purple-500 transition-colors duration-300"
          value={task.name}
          onChange={(e) => updateTask(task.listId, task.id, { name: e.target.value })}
        />
        <div className="flex">
          {listIndex > 0 && (
            <button
              className="text-blue-400 mr-2 hover:text-blue-300 transition-colors duration-300"
              onClick={() => moveTask(task.id, task.listId, 'left')}
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {listIndex < lists.length - 1 && (
            <button
              className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
              onClick={() => moveTask(task.id, task.listId, 'right')}
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
      <textarea
        className="bg-gray-600 w-full p-2 rounded mb-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow duration-300"
        value={task.description}
        onChange={(e) => updateTask(task.listId, task.id, { description: e.target.value })}
        placeholder="Descripción"
      />
      <div className="flex flex-wrap gap-2 mb-2">
        {task.tags.map((tag, tagIndex) => (
          <span key={tagIndex} className="bg-purple-700 px-2 py-1 rounded text-sm text-purple-100 flex items-center">
            {tag}
            <button className="ml-1 text-purple-200 hover:text-purple-100 transition-colors duration-300" onClick={() => deleteTag(task.listId, task.id, tag)}>
              <Trash2 size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Nueva etiqueta"
            className="bg-gray-600 p-1 rounded mr-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow duration-300"
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                addTag(task.listId, task.id, e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <button
            className="text-green-400 flex items-center hover:text-green-300 transition-colors duration-300"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              addTag(task.listId, task.id, input.value);
              input.value = '';
            }}
          >
            <Tag size={16} className="mr-1" /> Añadir
          </button>
        </div>
        <div className="flex items-center">
          <Calendar size={16} className="mr-2 text-gray-400" />
          <DatePicker
            selected={task.dueDate ? new Date(task.dueDate) : null}
            onChange={(date: Date | null) => updateTask(task.listId, task.id, { dueDate: date ? date.toISOString() : null })}
            className="bg-gray-600 p-1 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow duration-300"
            placeholderText="Fecha límite"
          />
        </div>
      </div>
      <button className="text-red-400 hover:text-red-300 transition-colors duration-300" onClick={() => deleteTask(task.listId, task.id)}>
        <Trash2 size={16} />
      </button>
    </div>
  ), [updateTask, deleteTag, addTag, deleteTask, moveTask, lists.length]);

  const renderList = useCallback((list: List, index: number) => (
    <div key={list.id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-100">{list.name}</h2>
      {filteredTasks.filter(task => task.listId === list.id).map(task => renderTask(task, index))}
      <button
        className="w-full bg-purple-600 py-2 rounded-lg mt-4 flex items-center justify-center text-white hover:bg-purple-500 transition-colors duration-300"
        onClick={() => addTask(list.id)}
      >
        <Plus size={20} className="mr-2" /> Añadir Tarea
      </button>
    </div>
  ), [filteredTasks, renderTask, addTask]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <div className="bg-gray-900 w-20 p-4 flex flex-col items-center border-r border-gray-700">
        <button onClick={() => setActiveView('home')} className="mb-6 text-gray-400 hover:text-white transition-colors duration-300">
          <Home size={24} />
        </button>
        <button onClick={() => setActiveView('charts')} className="mb-6 text-gray-400 hover:text-white transition-colors duration-300">
          <BarChart size={24} />
        </button>
        <button onClick={() => setActiveView('timeline')} className="mb-6 text-gray-400 hover:text-white transition-colors duration-300">
          <Calendar size={24} />
        </button>
        <button onClick={saveData} className="mb-6 text-gray-400 hover:text-white transition-colors duration-300" title="Export Data">
          <Save size={24} />
        </button>
        <label className="cursor-pointer mb-6 text-gray-400 hover:text-white transition-colors duration-300" title="Import Data">
          <Upload size={24} />
          <input
            type="file"
            accept=".json"
            onChange={importData}
            style={{ display: 'none' }}
          />
        </label>
        <br />
        <hr />
        <Link to="/energy">
        <button className="mb-6 text-gray-400 hover:text-white transition-colors duration-300">
          <Zap size={24} />
        </button>
        </Link>
        <Link to="/plan">
        <button className="mb-6 text-gray-400 hover:text-white transition-colors duration-300">
          <Orbit size={24} />
        </button>
        </Link>
        <Link to="/savings">
        <button className="mb-6 text-gray-400 hover:text-white transition-colors duration-300">
          <Coins size={24} />
        </button>
        <Link to="/multijob-savings">
        <button className="mb-6 text-gray-400 hover:text-white transition-colors duration-300">
          <Coins size={24} />
        </button>
        </Link>

      </div>
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Curseline</h1>
        {error && (
          <Alert onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {activeView === 'home' ? (
          <>
            <div className="mb-8">
              <div className="flex items-center bg-gray-700 rounded-lg p-2 mb-4 focus-within:ring-2 focus-within:ring-purple-500 transition-shadow duration-300">
                <Search className="mr-2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar tareas..."
                  className="bg-transparent outline-none flex-1 text-gray-100"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                    className={`px-2 py-1 rounded text-sm ${selectedTags.includes(tag)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      } transition-colors duration-300`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {lists.map((list, index) => renderList(list, index))}
            </div>
          </>
        ) : activeView === 'charts' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-gray-100">Tareas por Lista</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={taskStats}>
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#374151', border: 'none' }} />
                  <Bar dataKey="tasks" fill="#8B5CF6" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-gray-100">Estado de Tareas</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={completionStats}>
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#374151', border: 'none' }} />
                  <Bar dataKey="Completadas" fill="#10B981" />
                  <Bar dataKey="Pendientes" fill="#EF4444" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          renderTimeline()
        )}
      </div>
    </div>
  );
};

export default CurselineToDo;