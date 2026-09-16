import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { forceReloadFromFiles } from '../services/fileService';

interface AgencyManagerProps {
  agencies: string[];
  onAgenciesUpdate: (agencies: string[]) => void;
}

export const AgencyManager: React.FC<AgencyManagerProps> = ({ agencies, onAgenciesUpdate }) => {
  const [newAgency, setNewAgency] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAddAgency = () => {
    if (newAgency.trim() && !agencies.includes(newAgency.trim())) {
      const updatedAgencies = [...agencies, newAgency.trim()];
      onAgenciesUpdate(updatedAgencies);
      setNewAgency('');
    }
  };

  const handleEditAgency = (index: number) => {
    setEditingIndex(index);
    setEditingValue(agencies[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const updatedAgencies = [...agencies];
      updatedAgencies[editingIndex] = editingValue.trim();
      onAgenciesUpdate(updatedAgencies);
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleDeleteAgency = (index: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa đại lý này?')) {
      const updatedAgencies = agencies.filter((_, i) => i !== index);
      onAgenciesUpdate(updatedAgencies);
    }
  };

  const handleReloadFromFiles = () => {
    if (confirm('Bạn có muốn reload dữ liệu từ file config.json và data.csv?')) {
      forceReloadFromFiles();
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-[#ba7c38]">Quản Lý Đại Lý ({agencies.length})</h3>
        <Button 
          onClick={handleReloadFromFiles}
          variant="secondary"
          className="!w-auto px-3.5 py-1.5 text-xs bg-[#1c140e] hover:bg-[#281b12] text-[#ffdca3] border border-[#ba7c38]/40 shadow transition-colors"
        >
          🔄 Reload Files
        </Button>
      </div>
      
      {/* Add new agency */}
      <div className="mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newAgency}
            onChange={e => setNewAgency(e.target.value)}
            placeholder="Nhập tên đại lý mới..."
            onKeyPress={e => e.key === 'Enter' && handleAddAgency()}
          />
          <Button 
            onClick={handleAddAgency}
            disabled={!newAgency.trim()}
            className="!w-auto px-4"
          >
            Thêm
          </Button>
        </div>
      </div>

      {/* Agency list */}
      <div className="max-h-64 overflow-y-auto rounded-lg border border-[#ba7c38]/30 bg-[#140f0b]">
        {agencies.length > 0 ? (
          <div className="divide-y divide-[#ba7c38]/15">
            {agencies.map((agency, index) => (
              <div key={index} className="p-3 bg-[#140f0b] hover:bg-[#ba7c38]/10 flex items-center justify-between transition-colors">
                {editingIndex === index ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="text"
                      value={editingValue}
                      onChange={e => setEditingValue(e.target.value)}
                      className="flex-1"
                      onKeyPress={e => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      autoFocus
                    />
                    <Button onClick={handleSaveEdit} className="!w-auto px-3 py-1 text-sm">
                      Lưu
                    </Button>
                    <Button 
                      onClick={handleCancelEdit} 
                      variant="secondary" 
                      className="!w-auto px-3 py-1 text-sm"
                    >
                      Hủy
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="text-[#e8ded1] flex-1 font-medium">{agency}</span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEditAgency(index)}
                        className="text-[#ffdca3] hover:text-white text-xs font-semibold cursor-pointer"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteAgency(index)}
                        className="text-rose-400 hover:text-rose-300 text-xs font-semibold cursor-pointer"
                      >
                        Xóa
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-[#a89f91]">Chưa có đại lý nào.</p>
        )}
      </div>
    </Card>
  );
};