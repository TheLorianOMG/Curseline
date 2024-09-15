import React, { useState, useCallback, useMemo } from 'react';
import { Trash2, Plus, Tag, Search, Home, BarChart, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const INITIAL_LISTS = [
  { id: '1', name: 'Por hacer', tasks: [] },
  { id: '2', name: 'En progreso', tasks: [] },
  { id: '3', name: 'Completado', tasks: [] },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const App = () => {
  const [lists, setLists] = useState(INITIAL_LISTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [activeView, setActiveView] = useState('home');

  const updateLists = useCallback((updater) => {
    setLists(prevLists => prevLists.map(updater));
  }, []);

  const addTask = useCallback((listId) => {
    updateLists(list => 
      list.id === listId
        ? { ...list, tasks: [...list.tasks, { id: Date.now().toString(), name: 'Nueva tarea', description: '', tags: [] }] }
        : list
    );
  }, [updateLists]);

  const updateTask = useCallback((listId, taskId, updates) => {
    updateLists(list => 
      list.id === listId
        ? { ...list, tasks: list.tasks.map(task => task.id === taskId ? { ...task, ...updates } : task) }
        : list
    );
  }, [updateLists]);

  const deleteTask = useCallback((listId, taskId) => {
    updateLists(list => 
      list.id === listId
        ? { ...list, tasks: list.tasks.filter(task => task.id !== taskId) }
        : list
    );
  }, [updateLists]);

  const addTag = useCallback((listId, taskId, newTag) => {
    updateTask(listId, taskId, { tags: tags => [...tags, newTag] });
  }, [updateTask]);

  const deleteTag = useCallback((listId, taskId, tagToDelete) => {
    updateTask(listId, taskId, { tags: tags => tags.filter(tag => tag !== tagToDelete) });
  }, [updateTask]);

  const moveTask = useCallback((taskId, sourceListId, direction) => {
    setLists(prevLists => {
      const newLists = JSON.parse(JSON.stringify(prevLists));
      const sourceListIndex = newLists.findIndex(list => list.id === sourceListId);
      const destListIndex = direction === 'right' ? sourceListIndex + 1 : sourceListIndex - 1;
      
      if (destListIndex < 0 || destListIndex >= newLists.length) return prevLists;

      const sourceList = newLists[sourceListIndex];
      const destList = newLists[destListIndex];
      const taskIndex = sourceList.tasks.findIndex(task => task.id === taskId);
      
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
    { name: 'Estado', Completadas: lists.find(list => list.name === 'Completado')?.tasks.length || 0, 
      Pendientes: lists.filter(list => list.name !== 'Completado').reduce((acc, list) => acc + list.tasks.length, 0) }
  ], [lists]);

  const renderTask = useCallback((task, listIndex) => (
    <div key={task.id} className="bg-gray-700 p-4 rounded-lg mb-4">
      <div className="flex justify-between items-center mb-2">
        <input
          className="bg-transparent border-b border-gray-500 flex-grow mr-2 text-lg"
          value={task.name}
          onChange={(e) => updateTask(task.listId, task.id, { name: e.target.value })}
        />
        <div className="flex">
          {listIndex > 0 && (
            <button
              className="text-blue-400 mr-2"
              onClick={() => moveTask(task.id, task.listId, 'left')}
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {listIndex < lists.length - 1 && (
            <button
              className="text-blue-400"
              onClick={() => moveTask(task.id, task.listId, 'right')}
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
      <textarea
        className="bg-gray-600 w-full p-2 rounded mb-2"
        value={task.description}
        onChange={(e) => updateTask(task.listId, task.id, { description: e.target.value })}
        placeholder="Descripción"
      />
      <div className="flex flex-wrap gap-2 mb-2">
        {task.tags.map((tag, tagIndex) => (
          <span key={tagIndex} className="bg-purple-600 px-2 py-1 rounded text-sm flex items-center">
            {tag}
            <button className="ml-1" onClick={() => deleteTag(task.listId, task.id, tag)}>
              <Trash2 size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex justify-between">
        <button
          className="text-green-400 flex items-center"
          onClick={(e) => {
            e.preventDefault();
            const newTag = prompt('Ingrese nueva etiqueta:');
            if (newTag) addTag(task.listId, task.id, newTag);
          }}
        >
          <Tag size={16} className="mr-1" /> Añadir Tag
        </button>
        <button className="text-red-400" onClick={() => deleteTask(task.listId, task.id)}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  ), [updateTask, deleteTag, addTag, deleteTask, moveTask, lists.length]);

  const renderList = useCallback((list, index) => (
    <div key={list.id} className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">{list.name}</h2>
      {filteredTasks.filter(task => task.listId === list.id).map(task => renderTask(task, index))}
      <button
        className="w-full bg-purple-600 py-2 rounded-lg mt-4 flex items-center justify-center"
        onClick={() => addTask(list.id)}
      >
        <Plus size={20} className="mr-2" /> Añadir Tarea
      </button>
    </div>
  ), [filteredTasks, renderTask, addTask]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#593873] to-black text-white">
      <div className="bg-gray-900 w-20 p-4 flex flex-col items-center">
        <button onClick={() => setActiveView('home')} className="mb-4">
          <Home size={24} />
        </button>
        <button onClick={() => setActiveView('charts')} className="mb-4">
          <BarChart size={24} />
        </button>
      </div>
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-8">Curseline</h1>
        {activeView === 'home' ? (
          <>
            <div className="mb-8">
              <div className="flex items-center bg-gray-700 rounded-lg p-2 mb-4">
                <Search className="mr-2" />
                <input
                  type="text"
                  placeholder="Buscar tareas..."
                  className="bg-transparent outline-none flex-1"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                    className={`px-2 py-1 rounded ${selectedTags.includes(tag) ? 'bg-purple-600' : 'bg-gray-700'}`}
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Tareas por Lista</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={taskStats}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#8884d8" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Estado de Tareas</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={completionStats}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Completadas" fill="#82ca9d" />
                  <Bar dataKey="Pendientes" fill="#8884d8" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;