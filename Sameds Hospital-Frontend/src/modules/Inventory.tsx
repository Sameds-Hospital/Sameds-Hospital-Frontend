import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Package, Plus, AlertTriangle } from 'lucide-react'
import { useHMS } from '../store/HMSContext'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { FormField } from '../components/ui/FormField'
import { Badge } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { SectionCard } from '../components/ui/SectionCard'
import type { InventoryItem, Supplier } from '../types'

type Tab = 'items' | 'suppliers'

const ITEM_EMPTY: Omit<InventoryItem,'id'> = {
  name: '', category: 'Medical Supply', quantity: 0, unit: 'Pcs',
  reorderLevel: 10, location: '', supplier: '', unitCost: 0, lastRestocked: '', status: 'In Stock',
}
const SUP_EMPTY: Omit<Supplier,'id'> = {
  name: '', contact: '', email: '', phone: '', address: '',
  category: '', items: '', rating: 5, status: 'Active',
}

export function Inventory() {
  const { state, dispatch, nextId } = useHMS()
  const [tab, setTab] = useState<Tab>('items')
  const [showItem, setShowItem] = useState(false)
  const [showSup, setShowSup] = useState(false)
  const [itemForm, setItemForm] = useState({ ...ITEM_EMPTY })
  const [supForm, setSupForm] = useState({ ...SUP_EMPTY })

  const setI = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setItemForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const setS = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setSupForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const itemStatus = (qty: number, reorder: number): InventoryItem['status'] => {
    if (qty === 0) return 'Out of Stock'
    if (qty <= reorder) return 'Low Stock'
    return 'In Stock'
  }

  const submitItem = (e: FormEvent) => {
    e.preventDefault()
    const qty = Number(itemForm.quantity); const ro = Number(itemForm.reorderLevel)
    const item: InventoryItem = {
      ...itemForm, quantity: qty, reorderLevel: ro, unitCost: Number(itemForm.unitCost),
      id: nextId('INV-I', state.inventoryItems),
      status: itemStatus(qty, ro),
    }
    dispatch({ type: 'ADD_INVENTORY_ITEM', payload: item })
    setItemForm({ ...ITEM_EMPTY }); setShowItem(false)
  }

  const submitSup = (e: FormEvent) => {
    e.preventDefault()
    const sup: Supplier = { ...supForm, rating: Number(supForm.rating), id: nextId('SUP', state.suppliers) }
    dispatch({ type: 'ADD_SUPPLIER', payload: sup })
    setSupForm({ ...SUP_EMPTY }); setShowSup(false)
  }

  const itemCols: Column<InventoryItem>[] = [
    { key: 'id', label: 'ID', width: '110px' },
    { key: 'name', label: 'Item', sortable: true },
    { key: 'category', label: 'Category', badge: true },
    { key: 'quantity', label: 'Qty', sortable: true },
    { key: 'unit', label: 'Unit' },
    { key: 'reorderLevel', label: 'Reorder' },
    { key: 'location', label: 'Location' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'unitCost', label: 'Unit Cost', render: i => `$${Number(i.unitCost).toFixed(2)}` },
    { key: 'lastRestocked', label: 'Last Restocked', sortable: true },
    { key: 'status', label: 'Status', badge: true, sortable: true },
  ]

  const supCols: Column<Supplier>[] = [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'name', label: 'Supplier', sortable: true },
    { key: 'contact', label: 'Contact Person' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'category', label: 'Category' },
    { key: 'items', label: 'Items Supplied' },
    { key: 'rating', label: 'Rating', render: s => '★'.repeat(Math.round(Number(s.rating))) },
    { key: 'status', label: 'Status', badge: true },
  ]

  const alerts = state.inventoryItems.filter(i => i.status !== 'In Stock')

  return (
    <div className="module-page">
      <PageHeader
        title="Inventory Management"
        subtitle="Medical supplies, equipment and procurement"
        icon={<Package size={22} />}
        actions={
          <div className="btn-group">
            <button type="button" className="btn btn--primary" onClick={() => setShowItem(true)}><Plus size={14} /> Add Item</button>
            <button type="button" className="btn btn--secondary" onClick={() => setShowSup(true)}><Plus size={14} /> Add Supplier</button>
          </div>
        }
      />

      <div className="mini-stats-row">
        <div className="mini-stat"><span>Total Items</span><strong>{state.inventoryItems.length}</strong></div>
        <div className="mini-stat"><Badge variant="green">In Stock</Badge><strong>{state.inventoryItems.filter(i => i.status === 'In Stock').length}</strong></div>
        <div className="mini-stat"><Badge variant="yellow">Low Stock</Badge><strong>{state.inventoryItems.filter(i => i.status === 'Low Stock').length}</strong></div>
        <div className="mini-stat"><Badge variant="red">Out of Stock</Badge><strong>{state.inventoryItems.filter(i => i.status === 'Out of Stock').length}</strong></div>
        <div className="mini-stat"><span>Suppliers</span><strong>{state.suppliers.length}</strong></div>
      </div>

      {alerts.length > 0 && (
        <SectionCard title="Inventory Alerts">
          <div className="alert-list">
            {alerts.map(i => (
              <div key={i.id} className={`alert-item alert-item--${i.status === 'Out of Stock' ? 'error' : 'warning'}`}>
                <AlertTriangle size={14} />
                <span>{i.name} — {i.status} (Qty: {i.quantity} {i.unit}, Reorder at: {i.reorderLevel})</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <div className="tab-bar">
        <button type="button" className={`tab-btn${tab === 'items' ? ' tab-btn--active' : ''}`} onClick={() => setTab('items')}>Items ({state.inventoryItems.length})</button>
        <button type="button" className={`tab-btn${tab === 'suppliers' ? ' tab-btn--active' : ''}`} onClick={() => setTab('suppliers')}>Suppliers ({state.suppliers.length})</button>
      </div>

      <SectionCard noPad>
        {tab === 'items' && <DataTable columns={itemCols} data={state.inventoryItems} searchable searchKeys={['name','category','location','supplier']} />}
        {tab === 'suppliers' && <DataTable columns={supCols} data={state.suppliers} searchable searchKeys={['name','contact','category']} />}
      </SectionCard>

      {showItem && (
        <Modal title="Add Inventory Item" onClose={() => setShowItem(false)} size="lg">
          <form onSubmit={submitItem} className="form-grid-2">
            <FormField label="Item Name" name="name" value={itemForm.name} onChange={setI} required />
            <FormField label="Category" name="category" type="select" value={itemForm.category} onChange={setI}
              options={['Medical Supply','Equipment','PPE','Consumable','Furniture'].map(v => ({ value: v, label: v }))} />
            <FormField label="Quantity" name="quantity" type="number" value={itemForm.quantity} onChange={setI} required min={0} />
            <FormField label="Unit" name="unit" value={itemForm.unit} onChange={setI} placeholder="e.g. Pcs, Boxes" />
            <FormField label="Reorder Level" name="reorderLevel" type="number" value={itemForm.reorderLevel} onChange={setI} min={0} />
            <FormField label="Location" name="location" value={itemForm.location} onChange={setI} placeholder="Store Room A" />
            <FormField label="Supplier" name="supplier" type="select" value={itemForm.supplier} onChange={setI}
              options={state.suppliers.map(s => ({ value: s.name, label: s.name }))} />
            <FormField label="Unit Cost (USD)" name="unitCost" type="number" value={itemForm.unitCost} onChange={setI} step="0.01" min={0} />
            <FormField label="Last Restocked" name="lastRestocked" type="date" value={itemForm.lastRestocked} onChange={setI} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowItem(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Add Item</button>
            </div>
          </form>
        </Modal>
      )}

      {showSup && (
        <Modal title="Add Supplier" onClose={() => setShowSup(false)} size="md">
          <form onSubmit={submitSup} className="form-grid-2">
            <FormField label="Supplier Name" name="name" value={supForm.name} onChange={setS} required />
            <FormField label="Contact Person" name="contact" value={supForm.contact} onChange={setS} required />
            <FormField label="Phone" name="phone" type="tel" value={supForm.phone} onChange={setS} required />
            <FormField label="Email" name="email" type="email" value={supForm.email} onChange={setS} required />
            <FormField label="Address" name="address" value={supForm.address} onChange={setS} />
            <FormField label="Category" name="category" value={supForm.category} onChange={setS} />
            <FormField label="Items Supplied" name="items" value={supForm.items} onChange={setS} placeholder="e.g. Gloves, Syringes" />
            <FormField label="Rating (1-5)" name="rating" type="number" value={supForm.rating} onChange={setS} min={1} />
            <div className="form-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setShowSup(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Add Supplier</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

