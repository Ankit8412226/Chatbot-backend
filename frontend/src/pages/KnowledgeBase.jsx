import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth.js';
import { kbAPI } from '../lib/api.js';
import { Plus, BookOpen, Search, Edit, Trash2, Upload, Download } from 'lucide-react';
import Badge from '../components/Badge.jsx';
import toast from 'react-hot-toast';

const KnowledgeBase = () => {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [newItem, setNewItem] = useState({
    question: '',
    answer: '',
    category: 'general',
    tags: [],
    priority: 0
  });

  useEffect(() => {
    loadKnowledgeBase();
  }, [searchTerm, selectedCategory, pagination.page]);

  const loadKnowledgeBase = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: 20
      };
      
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;

      const response = await kbAPI.getAll(params);
      setItems(response.data.items);
      setCategories(response.data.categories);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to load knowledge base:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    
    try {
      await kbAPI.create({
        ...newItem,
        tags: newItem.tags.filter(tag => tag.trim())
      });
      
      setNewItem({
        question: '',
        answer: '',
        category: 'general',
        tags: [],
        priority: 0
      });
      setShowCreateForm(false);
      await loadKnowledgeBase();
      toast.success('Knowledge item created successfully!');
    } catch (error) {
      console.error('Failed to create knowledge item:', error);
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    
    try {
      await kbAPI.update(editingItem.id, {
        ...editingItem,
        tags: editingItem.tags.filter(tag => tag.trim())
      });
      
      setEditingItem(null);
      await loadKnowledgeBase();
      toast.success('Knowledge item updated successfully!');
    } catch (error) {
      console.error('Failed to update knowledge item:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this knowledge item?')) {
      return;
    }

    try {
      await kbAPI.delete(itemId);
      await loadKnowledgeBase();
      toast.success('Knowledge item deleted successfully');
    } catch (error) {
      console.error('Failed to delete knowledge item:', error);
    }
  };

  const handleTagInput = (value, setter) => {
    const tags = value.split(',').map(tag => tag.trim());
    setter(prev => ({ ...prev, tags }));
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!Array.isArray(data)) {
        throw new Error('File must contain an array of knowledge items');
      }

      await kbAPI.import(data);
      await loadKnowledgeBase();
      toast.success(`Imported ${data.length} knowledge items!`);
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Import failed. Please check your file format.');
    }
  };

  const handleExport = () => {
    const exportData = items.map(item => ({
      question: item.question,
      answer: item.answer,
      category: item.category,
      tags: item.tags,
      priority: item.priority
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'knowledge-base.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="mt-2 text-gray-600">
            Manage your chatbot's knowledge and training data
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center space-x-3">
            <label className="btn-secondary cursor-pointer flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handleExport}
              className="btn-secondary flex items-center space-x-2"
              disabled={items.length === 0}
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions and answers..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingItem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? 'Edit Knowledge Item' : 'Create New Knowledge Item'}
            </h3>
            
            <form onSubmit={editingItem ? handleUpdateItem : handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={editingItem ? editingItem.question : newItem.question}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (editingItem) {
                      setEditingItem({ ...editingItem, question: value });
                    } else {
                      setNewItem({ ...newItem, question: value });
                    }
                  }}
                  className="input-field"
                  placeholder="What question does this answer?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer
                </label>
                <textarea
                  value={editingItem ? editingItem.answer : newItem.answer}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (editingItem) {
                      setEditingItem({ ...editingItem, answer: value });
                    } else {
                      setNewItem({ ...newItem, answer: value });
                    }
                  }}
                  rows={4}
                  className="input-field"
                  placeholder="Provide a helpful answer..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingItem ? editingItem.category : newItem.category}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (editingItem) {
                        setEditingItem({ ...editingItem, category: value });
                      } else {
                        setNewItem({ ...newItem, category: value });
                      }
                    }}
                    className="input-field"
                    placeholder="e.g., billing, technical, general"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority (0-10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={editingItem ? editingItem.priority : newItem.priority}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (editingItem) {
                        setEditingItem({ ...editingItem, priority: value });
                      } else {
                        setNewItem({ ...newItem, priority: value });
                      }
                    }}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingItem ? editingItem.tags.join(', ') : newItem.tags.join(', ')}
                  onChange={(e) => handleTagInput(e.target.value, editingItem ? setEditingItem : setNewItem)}
                  className="input-field"
                  placeholder="e.g., pricing, features, support"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingItem ? 'Update Item' : 'Create Item'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Knowledge Items */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No knowledge items yet</h3>
            <p className="text-gray-600 mb-4">
              Add your first Q&A pair to start training your chatbot
            </p>
            {isAdmin && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                Add Knowledge Item
              </button>
            )}
          </div>
        ) : (
          items.map((item) => (
            <div key={item._id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{item.question}</h3>
                    <Badge variant="info" size="xs">{item.category}</Badge>
                    {item.priority > 0 && (
                      <Badge variant="warning" size="xs">Priority: {item.priority}</Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-3">{item.answer}</p>
                  
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="default" size="xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Used: {item.usage?.timesUsed || 0} times</span>
                    {item.usage?.avgRating > 0 && (
                      <span>Rating: {item.usage.avgRating.toFixed(1)}/5</span>
                    )}
                    <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit item"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;