import React, { useState, useEffect } from 'react';
import { UserCheck, Search, CheckCircle2, X, AlertCircle, RotateCcw, User } from 'lucide-react';
import { fetchAvailableCaregiversApi, selectCaregiverApi } from '../services/api';
import { useAccessibility } from '../context/AccessibilityContext';

interface Props {
  onClose: () => void;
  onCaregiverSelected: (caregiver: any) => void;
  currentCaregiver?: any;
}

export const CaregiverSelectionModal: React.FC<Props> = ({
  onClose,
  onCaregiverSelected,
  currentCaregiver,
}) => {
  const { t } = useAccessibility();
  const [caregivers, setCaregivers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(
    currentCaregiver?._id || currentCaregiver?.id || currentCaregiver?.firebaseUid || null
  );
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    loadCaregivers();
  }, []);

  const loadCaregivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAvailableCaregiversApi();
      if (res && res.success && Array.isArray(res.caregivers)) {
        setCaregivers(res.caregivers);
      } else {
        setError(res.error || 'Unable to fetch available caregivers from database.');
      }
    } catch (err: any) {
      setError('Network error loading caregivers.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSelection = async (cg: any) => {
    const cgId = cg._id || cg.id || cg.firebaseUid;
    setSelectedId(cgId);
    setSaving(true);
    setError(null);
    try {
      const res = await selectCaregiverApi(cgId);
      if (res && res.success) {
        onCaregiverSelected(cg);
        onClose();
      } else {
        setError(res.error || 'Failed to save caregiver assignment.');
      }
    } catch (err: any) {
      setError('Error connecting to server.');
    } finally {
      setSaving(false);
    }
  };

  const filteredCaregivers = caregivers.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284C7, #0D9488)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserCheck size={24} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Select Your Caregiver
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Choose a registered caregiver from the database
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search caregiver by name or email..."
            style={{
              width: '100%',
              height: '46px',
              paddingLeft: '42px',
              paddingRight: '14px',
              borderRadius: '12px',
              background: '#F8FAFC',
              border: '1px solid var(--border-glass)',
              fontSize: '15px',
              outline: 'none',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              background: '#FFE4E6',
              border: '1px solid #FECDD3',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#BE123C',
              fontSize: '13px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Caregiver List Container */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              <RotateCcw size={28} className="pulse-mic" style={{ margin: '0 auto 8px' }} color="var(--accent-primary)" />
              <p style={{ fontSize: '14px' }}>Fetching registered caregivers from database...</p>
            </div>
          ) : filteredCaregivers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              <User size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>No Caregivers Found</p>
              <p style={{ fontSize: '13px' }}>No matching registered caregiver accounts exist in MongoDB.</p>
            </div>
          ) : (
            filteredCaregivers.map((cg) => {
              const cgId = cg._id || cg.id || cg.firebaseUid;
              const isSelected = selectedId === cgId;
              return (
                <div
                  key={cgId}
                  onClick={() => handleConfirmSelection(cg)}
                  style={{
                    background: isSelected ? '#F0F9FF' : '#F8FAFC',
                    border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: saving ? 'wait' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary-glow)',
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '16px',
                      }}
                    >
                      {cg.name ? cg.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>
                        {cg.name || 'Caregiver'}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{cg.email}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={saving}
                    className={`btn-primary ${isSelected ? 'btn-emerald' : 'btn-glass-subtle'}`}
                    style={{ minHeight: '38px', padding: '0 14px', fontSize: '13px', borderRadius: '8px' }}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 size={15} /> Assigned
                      </>
                    ) : (
                      'Select'
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
