import { useState } from 'react'
import { HiDotsHorizontal } from 'react-icons/hi'
import './App.css'

type FlowNodeId =
  | 'incoming'
  | 'menu'
  | 'play-sales'
  | 'play-support'
  | 'play-billings'
  | 'play-default'
  | 'customer-sales'
  | 'customer-support'
  | 'transfer-voicemail'
  | 'transfer-sales'
  | 'transfer-support'
  | 'skill-node'

function App() {
  const [showRightSidebar, setShowRightSidebar] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<'standard-menu-context' | null>(null)
  const [workflowCreated, setWorkflowCreated] = useState(false)
  const [openNodeMenuId, setOpenNodeMenuId] = useState<FlowNodeId | null>(null)
  const [editingNodeId, setEditingNodeId] = useState<FlowNodeId | null>(null)
  const [selectedDestination, setSelectedDestination] = useState('operators')
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState('')
  const [skillSelectionEnabled, setSkillSelectionEnabled] = useState(false)
  const [nodeSkills, setNodeSkills] = useState<Record<string, string>>({})
  const [nodeDestinations, setNodeDestinations] = useState<Record<string, string>>({})
  const [showPrototypeSettings, setShowPrototypeSettings] = useState(false)
  const [skillBadgeTooltip, setSkillBadgeTooltip] = useState(false)
  const [multipleSkills, setMultipleSkills] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [skillsApproach, setSkillsApproach] = useState('transfer-node')
  const [showAddStepSidebar, setShowAddStepSidebar] = useState(false)
  const [selectedStepType, setSelectedStepType] = useState('')
  const [newSkillNodeName, setNewSkillNodeName] = useState('')
  const [skillNodeAdded, setSkillNodeAdded] = useState(false)
  const [skillNodeName, setSkillNodeName] = useState('')
  const [mainView, setMainView] = useState('ivr-creation')

  const isPreview = selectedTemplate === 'standard-menu-context' && !workflowCreated
  const showFullWorkflow = selectedTemplate === 'standard-menu-context' && workflowCreated

  const getNodeType = (id: FlowNodeId) => {
    if (id === 'incoming') return 'INCOMING CALL'
    if (id === 'menu') return 'MENU'
    if (id.includes('play')) return 'PLAY'
    if (id.includes('customer')) return 'CUSTOMER DATA'
    if (id.includes('transfer')) return 'TRANSFER'
    if (id === 'skill-node') return 'SKILLS'
    return 'NODE'
  }

  const renderFlowNode = (id: FlowNodeId, label: string, options?: { incoming?: boolean, hasConnectorDown?: boolean, hasConnectorUp?: boolean }) => (
    <div className={`${options?.incoming ? 'ivr-flow-node ivr-flow-node-incoming' : 'ivr-flow-node'} ${options?.hasConnectorDown ? 'has-connector-down' : ''} ${options?.hasConnectorUp ? 'has-connector-up' : ''}`}>
      {!options?.incoming && (
        <div className="ivr-node-type-header">
          <span className="ivr-node-type-text">{getNodeType(id)}</span>
        </div>
      )}
      <div className="ivr-flow-node-content">
        <span className="ivr-flow-node-text">{label}</span>
        {(id.includes('transfer') || id === 'skill-node') && (
          <div className="ivr-node-details">
            {id.includes('transfer') && (
              <span className="ivr-destination-text">{nodeDestinations[id] || 'Operators'}</span>
            )}
            {nodeSkills[id] && (
              <div className="ivr-skill-badges">
                {nodeSkills[id].includes(',') ? (
                  // Multiple skills
                  (() => {
                    const skills = nodeSkills[id].split(',').map(s => s.trim());
                    if (skills.length >= 3) {
                      // Show first skill + "+X" for 3 or more skills
                      const remainingCount = skills.length - 1;
                      const remainingSkills = skills.slice(1);
                      return (
                        <>
                          <span 
                            className={`ivr-skill-badge ${skillBadgeTooltip ? 'has-tooltip' : ''}`}
                            data-tooltip="Skill"
                          >
                            {skills[0]}
                          </span>
                          <span 
                            className="ivr-skill-badge ivr-skill-badge-more has-tooltip"
                            data-tooltip={remainingSkills.join('\n')}
                          >
                            +{remainingCount}
                          </span>
                        </>
                      );
                    } else {
                      // Show all skills for 2 or fewer
                      return skills.map((skill, index) => (
                        <span 
                          key={index}
                          className={`ivr-skill-badge ${skillBadgeTooltip ? 'has-tooltip' : ''}`}
                          data-tooltip="Skill"
                        >
                          {skill}
                        </span>
                      ));
                    }
                  })()
                } else {
                  // Single skill
                  <span 
                    className={`ivr-skill-badge ${skillBadgeTooltip ? 'has-tooltip' : ''}`}
                    data-tooltip="Skill"
                  >
                    {skillBadgeTooltip ? nodeSkills[id] : `Skill: ${nodeSkills[id]}`}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        className="ivr-flow-node-menu-button"
        onClick={(event) => {
          event.stopPropagation()
          setOpenNodeMenuId((current) => (current === id ? null : id))
        }}
      >
        <HiDotsHorizontal size={12} />
      </button>
      {openNodeMenuId === id && (
        <div className="ivr-flow-node-menu">
          <button 
            type="button" 
            className="ivr-flow-node-menu-item"
            onClick={() => {
              setEditingNodeId(id)
              setOpenNodeMenuId(null)
              // Load existing node data or set defaults
              const existingDestination = nodeDestinations[id]
              const existingSkill = nodeSkills[id]
              
              if (existingDestination) {
                // Convert destination label back to form value
                const destinationValue = existingDestination === 'Operators' ? 'operators' :
                                       existingDestination === 'Voicemail' ? 'voicemail' :
                                       existingDestination === 'Contact Center' ? 'contact-center' :
                                       existingDestination === 'Team Member' ? 'team-member' :
                                       existingDestination === 'Room Phone' ? 'room-phone' : 'operators'
                setSelectedDestination(destinationValue)
              } else {
                setSelectedDestination('operators')
              }
              
              if (existingSkill) {
                setSkillSelectionEnabled(true)
                setSelectedSkill(existingSkill)
              } else {
                setSkillSelectionEnabled(false)
                setSelectedSkill('')
              }
              
              setSkillDropdownOpen(false)
            }}
          >
            Edit
          </button>
          <button type="button" className="ivr-flow-node-menu-item">
            Delete
          </button>
          <button type="button" className="ivr-flow-node-menu-item">
            Disconnect
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="ivr-root">
      <aside className="ivr-sidebar">
        <div className="sidebar-dropdown">
          <button className="sidebar-dropdown-button">
            Dialpadbeta 1 <span className="dropdown-arrow">▼</span>
          </button>
        </div>

        <div className="sidebar-menu">
          <div className="sidebar-menu-item">Office</div>
          
          <div className="sidebar-menu-item">
            Departments <span className="sidebar-expand">+</span>
          </div>
          
          <div className="sidebar-menu-item">
            Contact Centers <span className="sidebar-expand">+</span>
          </div>
          
          <div className="sidebar-menu-item">
            Geo. Routing <span className="sidebar-expand">+</span>
          </div>
          
          <div className="sidebar-menu-item">
            Coaching Groups <span className="sidebar-expand">+</span>
          </div>
          
          <div className="sidebar-menu-item">
            Coaching Teams <span className="sidebar-expand">+</span>
          </div>
          
          <div className="sidebar-menu-section">
            <div className="sidebar-menu-item">Channels & IVR</div>
            <div className="sidebar-submenu">
              <div className="sidebar-submenu-item">Digital channels</div>
              <div className="sidebar-submenu-item">Historical administration</div>
              <div className="sidebar-submenu-item sidebar-submenu-active">IVR workflows</div>
            </div>
          </div>
          
          <div className="sidebar-menu-item">AI Scorecards</div>
          <div className="sidebar-menu-item">Billing</div>
          <div className="sidebar-menu-item">Dialpad AI</div>
          <div className="sidebar-menu-item">Privacy and Legal</div>
        </div>
      </aside>

      <main className="ivr-main">
        <header className="ivr-header">
          <div className="ivr-header-left">
            <div className="ivr-breadcrumb">
              <span>Workflows</span>
              <span>/</span>
              <span>Standard menu with customer context</span>
            </div>
            <div className="ivr-title-row">
              <h1 className="ivr-title">Standard menu with customer context</h1>
              <span className="ivr-pill">Draft</span>
            </div>
          </div>
          <div className="ivr-header-right">
            <span className="ivr-header-meta">Last saved 2 minutes ago</span>
            <button type="button" className="ivr-button ivr-button-ghost">
              Save
            </button>
            <button type="button" className="ivr-button ivr-button-primary">
              Publish
            </button>
          </div>
        </header>

        <section className="ivr-layout">
          {mainView === 'ivr-creation' ? (
            <div className="ivr-canvas-wrapper">
              <div className="ivr-canvas-grid" />
              <div className={isPreview ? 'ivr-flow-layout is-preview' : 'ivr-flow-layout'}>
              {showFullWorkflow ? (
                <>
                  <div className="ivr-flow-row">
                    {renderFlowNode('incoming', 'Incoming Call', { incoming: true, hasConnectorDown: true })}
                  </div>

                  <div className="ivr-flow-row">
                    {renderFlowNode('menu', 'Menu', { hasConnectorUp: true, hasConnectorDown: true })}
                  </div>

                  {skillsApproach === 'new-skills-node' ? (
                    // New Skills Node layout
                    <>
                      <div className="ivr-flow-row ivr-flow-row-with-horizontal new-skills-layout">
                        {renderFlowNode('play-sales', 'Play – Sales', { hasConnectorUp: true, hasConnectorDown: true })}
                        {renderFlowNode('play-support', 'Play – Support', { hasConnectorUp: true, hasConnectorDown: true })}
                        {renderFlowNode('play-billings', 'Play – Billings', { hasConnectorUp: true, hasConnectorDown: true })}
                        {renderFlowNode('play-default', 'Play – Default', { hasConnectorUp: true, hasConnectorDown: true })}
                      </div>

                      <div className="ivr-flow-row">
                        {renderFlowNode('customer-sales', 'Customer Data – Sales', { hasConnectorUp: true, hasConnectorDown: true })}
                        {renderFlowNode('customer-support', 'Customer Data – Support', { hasConnectorUp: true, hasConnectorDown: true })}
                        {skillNodeAdded ? (
                          renderFlowNode('skill-node', skillNodeName || 'Skills', { hasConnectorUp: true })
                        } else {
                          <div className="ivr-flow-node ivr-flow-node-empty">
                            <button 
                              className="ivr-flow-node-plus"
                              onClick={() => setShowAddStepSidebar(true)}
                            >
                              +
                            </button>
                          </div>
                        )}
                        {renderFlowNode('transfer-voicemail', 'Transfer – Voicemail', { hasConnectorUp: true })}
                      </div>

                      <div className="ivr-flow-row">
                        {renderFlowNode('transfer-sales', 'Transfer – Sales', { hasConnectorUp: true })}
                        {renderFlowNode('transfer-support', 'Transfer – Support', { hasConnectorUp: true })}
                        <div className="ivr-flow-node ivr-flow-node-spacer" />
                        <div className="ivr-flow-node ivr-flow-node-spacer" />
                      </div>
                    </>
                  } else {
                    // Original Skills in Transfer Node layout
                    <>
                      <div className="ivr-flow-row ivr-flow-row-with-horizontal">
                        {renderFlowNode('play-sales', 'Play – Sales', { hasConnectorUp: true, hasConnectorDown: true })}
                        {renderFlowNode('play-support', 'Play – Support', { hasConnectorUp: true, hasConnectorDown: true })}
                        {renderFlowNode('play-default', 'Play – Default', { hasConnectorUp: true, hasConnectorDown: true })}
                      </div>

                      <div className="ivr-flow-row">
                        {renderFlowNode('customer-sales', 'Customer Data – Sales', { hasConnectorUp: true, hasConnectorDown: true })}
                        {renderFlowNode('customer-support', 'Customer Data – Support', { hasConnectorUp: true, hasConnectorDown: true })}
                        {renderFlowNode('transfer-voicemail', 'Transfer – Voicemail', { hasConnectorUp: true })}
                      </div>

                      <div className="ivr-flow-row">
                        {renderFlowNode('transfer-sales', 'Transfer – Sales', { hasConnectorUp: true })}
                        {renderFlowNode('transfer-support', 'Transfer – Support', { hasConnectorUp: true })}
                        <div className="ivr-flow-node ivr-flow-node-spacer" />
                      </div>
                    </>
                  )}
                </>
              } else {
                <div
                  className="ivr-node-stack"
                  style={{ top: '80px', left: '50%', transform: 'translateX(-50%)' }}
                >
                  <div className="ivr-node ivr-node-incoming">
                    <span className="ivr-node-label">Incoming Call</span>
                  </div>
                  <button
                    type="button"
                    className="ivr-plus-connector"
                    onClick={() => setShowRightSidebar(true)}
                  >
                    <span className="ivr-plus-circle">+</span>
                  </button>
                </div>
              } else {
                <div className="ivr-flow-layout-preview">
                  <div className="ivr-node ivr-node-incoming">
                    <span className="ivr-node-label">Incoming Call</span>
                  </div>
                  <button
                    type="button"
                    className="ivr-plus-connector"
                    onClick={() => setShowRightSidebar(true)}
                  >
                    <span className="ivr-plus-circle">+</span>
                  </button>
                </div>
              )}
            </div>

          {showRightSidebar && (
            <aside className="ivr-right-sidebar">
              <div className="ivr-right-sidebar-inner">
                <header className="ivr-right-sidebar-header">
                  <div className="ivr-right-sidebar-title">New workflow</div>
                </header>

                <section className="ivr-right-sidebar-section">
                  <button type="button" className="ivr-option-row ivr-option-row-strong">
                    <div className="ivr-option-text-group">
                      <div className="ivr-option-title">Create from scratch</div>
                      <div className="ivr-option-description">
                        Start with an empty canvas and build your own IVR workflow.
                      </div>
                    </div>
                    <div className="ivr-option-illustration" />
                  </button>
                </section>

                <section className="ivr-right-sidebar-section">
                  <div className="ivr-right-sidebar-subtitle">Start from a template</div>

                  <button type="button" className="ivr-option-row">
                    <div className="ivr-option-text-group">
                      <div className="ivr-option-title">Standard menu</div>
                      <div className="ivr-option-description">
                        Present a menu with multiple options for your callers.
                      </div>
                    </div>
                    <div className="ivr-option-illustration" />
                  </button>

                  <button
                    type="button"
                    className={
                      selectedTemplate === 'standard-menu-context'
                        ? 'ivr-option-row ivr-option-row-strong'
                        : 'ivr-option-row'
                    }
                    onClick={() => {
                      setSelectedTemplate('standard-menu-context')
                      setWorkflowCreated(false)
                    }}
                  >
                    <div className="ivr-option-text-group">
                      <div className="ivr-option-title">Standard menu with customer context</div>
                      <div className="ivr-option-description">
                        Use caller or account context to route to the right team.
                      </div>
                    </div>
                    <div className="ivr-option-illustration" />
                  </button>

                  <button type="button" className="ivr-option-row">
                    <div className="ivr-option-text-group">
                      <div className="ivr-option-title">Standard speech menu</div>
                      <div className="ivr-option-description">
                        Let callers speak their choice instead of pressing keys.
                      </div>
                    </div>
                    <div className="ivr-option-illustration" />
                  </button>
                </section>

                <footer className="ivr-right-sidebar-footer">
                  <button
                    type="button"
                    className="ivr-button ivr-button-ghost"
                    onClick={() => {
                      setSelectedTemplate(null)
                      setWorkflowCreated(false)
                      setShowRightSidebar(false)
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="ivr-button ivr-button-primary"
                    onClick={() => {
                      if (selectedTemplate === 'standard-menu-context') {
                        setWorkflowCreated(true)
                      }
                    }}
                  >
                    Create
                  </button>
                </footer>
              </div>
              </aside>
            )}
          </div>
        } else {
            // IVR Workflows table view
            <div className="ivr-workflows-container">
              <div className="ivr-workflows-header">
                <h2 className="ivr-workflows-title">IVR Workflows</h2>
                <button className="ivr-button ivr-button-primary">Create workflow</button>
              </div>
              
              <div className="ivr-workflows-tabs">
                <button className="ivr-workflows-tab ivr-workflows-tab-active">IVR workflows</button>
                <button className="ivr-workflows-tab">Media</button>
                <button className="ivr-workflows-tab">Speech</button>
              </div>

              <table className="ivr-workflows-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Entry points</th>
                    <th>Last edited by</th>
                    <th>Date edited</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="workflow-name">Customer Support Flow</div>
                    </td>
                    <td>3</td>
                    <td>
                      <div className="workflow-user">
                        <div className="user-avatar">JS</div>
                        <span>John Smith</span>
                      </div>
                    </td>
                    <td>December 01, 2025</td>
                    <td>
                      <button className="workflow-menu-button">⋯</button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="workflow-name">Sales Routing System</div>
                    </td>
                    <td>4</td>
                    <td>
                      <div className="workflow-user">
                        <div className="user-avatar">MJ</div>
                        <span>Maria Johnson</span>
                      </div>
                    </td>
                    <td>December 01, 2025</td>
                    <td>
                      <button className="workflow-menu-button">⋯</button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="workflow-name">Technical Help Desk</div>
                    </td>
                    <td>4</td>
                    <td>
                      <div className="workflow-user">
                        <div className="user-avatar">AB</div>
                        <span>Alex Brown</span>
                      </div>
                    </td>
                    <td>December 01, 2025</td>
                    <td>
                      <button className="workflow-menu-button">⋯</button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="workflow-name">Billing Inquiries</div>
                    </td>
                    <td>0</td>
                    <td>
                      <div className="workflow-user">
                        <div className="user-avatar">SL</div>
                        <span>Sarah Lee</span>
                      </div>
                    </td>
                    <td>December 01, 2025</td>
                    <td>
                      <button className="workflow-menu-button">⋯</button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="workflow-name">Emergency Services</div>
                    </td>
                    <td>0</td>
                    <td>
                      <div className="workflow-user">
                        <div className="user-avatar">DW</div>
                        <span>David Wilson</span>
                      </div>
                    </td>
                    <td>December 01, 2025</td>
                    <td>
                      <button className="workflow-menu-button">⋯</button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="workflow-name">Product Information</div>
                    </td>
                    <td>0</td>
                    <td>
                      <div className="workflow-user">
                        <div className="user-avatar">KT</div>
                        <span>Karen Taylor</span>
                      </div>
                    </td>
                    <td>November 28, 2025</td>
                    <td>
                      <button className="workflow-menu-button">⋯</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Edit Step Drawer */}
      {editingNodeId && (
        <div className="edit-drawer">
            <div className="edit-drawer-header">
              <h2 className="edit-drawer-title">Edit step</h2>
              <button 
                className="edit-drawer-close"
                onClick={() => setEditingNodeId(null)}
              >
                ×
              </button>
            </div>

            <div className="edit-drawer-content">
              <div className="edit-field-required">* required field</div>

              {editingNodeId === 'skill-node' ? (
                // Skills node editing
                <>
                  <div className="edit-section">
                    <label className="edit-label">
                      Type <span className="edit-required">*</span>
                    </label>
                    <div className="edit-type-grid">
                      <button className="edit-type-option edit-type-selected">Skills</button>
                    </div>
                  </div>

                  <div className="edit-section">
                    <label className="edit-label">
                      Name <span className="edit-required">*</span>
                    </label>
                    <input 
                      type="text"
                      className="edit-input"
                      placeholder="Enter skill node name"
                      value={skillNodeName}
                      onChange={(e) => setSkillNodeName(e.target.value)}
                    />
                  </div>

                  <div className="edit-section">
                    <div className="skill-selection-inline">
                      <div className="skill-selection-checkbox-container">
                        <input
                          type="checkbox"
                          id="select-skill-edit"
                          className="skill-selection-checkbox"
                          checked={true}
                          readOnly
                        />
                        <span className="skill-selection-checkbox-label">Select skill</span>
                      </div>
                      
                      <p className="skill-selection-description">Select or type a skill.</p>
                      <div className="skill-dropdown-container">
                        <button 
                          className="skill-dropdown-button"
                          onClick={() => setSkillDropdownOpen(!skillDropdownOpen)}
                        >
                          {multipleSkills 
                            ? (selectedSkills.length > 0 ? `${selectedSkills.length} skills selected` : 'Select skills')
                            : (selectedSkill || 'Select skill')
                          }
                          <span className="skill-dropdown-arrow">▼</span>
                        </button>
                        {skillDropdownOpen && (
                          <div className="skill-dropdown-menu">
                            <div className="skill-dropdown-list">
                              {multipleSkills ? (
                                // Multiple selection with checkboxes
                                <>
                                  {['Billing Support', 'Customer Service', 'Enterprise Customers', 'Payment Issues', 'Product XYZ Sales', 'Sales Support', 'Spanish', 'Subscription Management', 'Technical Support'].map((skill) => (
                                    <label 
                                      key={skill}
                                      className="skill-dropdown-item skill-dropdown-checkbox-item"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedSkills.includes(skill)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedSkills([...selectedSkills, skill])
                                          } else {
                                            setSelectedSkills(selectedSkills.filter(s => s !== skill))
                                          }
                                        }}
                                      />
                                      {skill}
                                    </label>
                                  ))}
                                  <div 
                                    className="skill-dropdown-item skill-dropdown-create skill-dropdown-create-sticky"
                                    onClick={() => {
                                      console.log('Create new skill')
                                      setSkillDropdownOpen(false)
                                    }}
                                  >
                                    + Create Skill
                                  </div>
                                </>
                              } else {
                                // Single selection
                                <>
                                  {['Billing Support', 'Customer Service', 'Enterprise Customers', 'Payment Issues', 'Product XYZ Sales', 'Sales Support', 'Spanish', 'Subscription Management', 'Technical Support'].map((skill) => (
                                    <div 
                                      key={skill}
                                      className="skill-dropdown-item"
                                      onClick={() => {
                                        setSelectedSkill(skill)
                                        setSkillDropdownOpen(false)
                                      }}
                                    >
                                      {skill}
                                    </div>
                                  ))}
                                  <div 
                                    className="skill-dropdown-item skill-dropdown-create skill-dropdown-create-sticky"
                                    onClick={() => {
                                      console.log('Create new skill')
                                      setSkillDropdownOpen(false)
                                    }}
                                  >
                                    + Create Skill
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              } else {
                // Regular transfer node editing
                <>
                  <div className="edit-section">
                    <label className="edit-label">
                      Type <span className="edit-required">*</span>
                    </label>
                    <div className="edit-type-grid">
                      <button className="edit-type-option">Menu</button>
                      <button className="edit-type-option">Collect</button>
                      <button className="edit-type-option">Play</button>
                      <button className="edit-type-option">Expert</button>
                      <button className="edit-type-option">Branch</button>
                      <button className="edit-type-option">Go-to</button>
                      <button className="edit-type-option">Assign</button>
                      <button className="edit-type-option">Customer Data</button>
                      <button className="edit-type-option edit-type-selected">Transfer</button>
                    </div>
                  </div>

                  <div className="edit-section">
                    <label className="edit-label">
                      Name <span className="edit-required">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="edit-input"
                      defaultValue={editingNodeId.includes('transfer') ? `Transfer ${editingNodeId.includes('sales') ? 'Sales' : 'Support'}` : 'Transfer Support'}
                    />
                  </div>

                  <div className="edit-section">
                    <label className="edit-checkbox-container">
                      <input type="checkbox" className="edit-checkbox" />
                      <span className="edit-checkbox-label">Enable call context</span>
                    </label>
                  </div>

                  <div className="edit-section">
                    <label className="edit-label">
                      Destination <span className="edit-required">*</span>
                    </label>
                    <div className="edit-radio-group">
                  <label className="edit-radio-container">
                    <input 
                      type="radio" 
                      name="destination" 
                      className="edit-radio" 
                      checked={selectedDestination === 'voicemail'}
                      onChange={() => setSelectedDestination('voicemail')}
                    />
                    <span className="edit-radio-label">Voicemail</span>
                  </label>
                  <label className="edit-radio-container">
                    <input 
                      type="radio" 
                      name="destination" 
                      className="edit-radio" 
                      checked={selectedDestination === 'operators'}
                      onChange={() => setSelectedDestination('operators')}
                    />
                    <span className="edit-radio-label">Operators</span>
                  </label>

                  {selectedDestination === 'operators' && (
                    <div className="skill-selection-inline">
                      <label className="skill-selection-checkbox-container">
                        <input 
                          type="checkbox" 
                          className="skill-selection-checkbox"
                          checked={skillSelectionEnabled}
                          onChange={(e) => {
                            setSkillSelectionEnabled(e.target.checked)
                            if (!e.target.checked) {
                              setSelectedSkill('')
                              setSkillDropdownOpen(false)
                            }
                          }}
                        />
                        <span className="skill-selection-checkbox-label">Select skill</span>
                      </label>
                      
                      {skillSelectionEnabled && (
                        <>
                          <p className="skill-selection-description">Select or type a skill.</p>
                          <div className="skill-dropdown-container">
                            <button 
                              className="skill-dropdown-button"
                              onClick={() => setSkillDropdownOpen(!skillDropdownOpen)}
                            >
                              {multipleSkills 
                                ? (selectedSkills.length > 0 ? `${selectedSkills.length} skills selected` : 'Select skills')
                                : (selectedSkill || 'Select skill')
                              }
                              <span className="skill-dropdown-arrow">▼</span>
                            </button>
                            {skillDropdownOpen && (
                              <div className="skill-dropdown-menu">
                                <div className="skill-dropdown-list">
                                  {multipleSkills ? (
                                    // Multiple selection with checkboxes
                                    <>
                                      {['Billing Support', 'Customer Service', 'Enterprise Customers', 'Product XYZ Sales', 'Sales Support', 'Spanish', 'Technical Support'].map((skill) => (
                                        <label 
                                          key={skill}
                                          className="skill-dropdown-item skill-dropdown-checkbox-item"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={selectedSkills.includes(skill)}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                setSelectedSkills([...selectedSkills, skill])
                                              } else {
                                                setSelectedSkills(selectedSkills.filter(s => s !== skill))
                                              }
                                            }}
                                          />
                                          {skill}
                                        </label>
                                      ))}
                                    </>
                                  } else {
                                    // Single selection
                                    <>
                                      <div 
                                        className="skill-dropdown-item"
                                        onClick={() => {
                                          setSelectedSkill('Billing Support')
                                          setSkillDropdownOpen(false)
                                        }}
                                      >
                                        Billing Support
                                      </div>
                                      <div 
                                        className="skill-dropdown-item"
                                        onClick={() => {
                                          setSelectedSkill('Customer Service')
                                          setSkillDropdownOpen(false)
                                        }}
                                      >
                                        Customer Service
                                      </div>
                                      <div 
                                        className="skill-dropdown-item"
                                        onClick={() => {
                                          setSelectedSkill('Enterprise Customers')
                                          setSkillDropdownOpen(false)
                                        }}
                                      >
                                        Enterprise Customers
                                      </div>
                                      <div 
                                        className="skill-dropdown-item"
                                        onClick={() => {
                                          setSelectedSkill('Product XYZ Sales')
                                          setSkillDropdownOpen(false)
                                        }}
                                      >
                                        Product XYZ Sales
                                      </div>
                                      <div 
                                        className="skill-dropdown-item"
                                        onClick={() => {
                                          setSelectedSkill('Sales Support')
                                          setSkillDropdownOpen(false)
                                        }}
                                      >
                                        Sales Support
                                      </div>
                                      <div 
                                        className="skill-dropdown-item"
                                        onClick={() => {
                                          setSelectedSkill('Spanish')
                                          setSkillDropdownOpen(false)
                                        }}
                                      >
                                        Spanish
                                      </div>
                                      <div 
                                        className="skill-dropdown-item"
                                        onClick={() => {
                                          setSelectedSkill('Technical Support')
                                          setSkillDropdownOpen(false)
                                        }}
                                      >
                                        Technical Support
                                      </div>
                                    </>
                                  )}
                                </div>
                                <div 
                                  className="skill-dropdown-item skill-dropdown-create skill-dropdown-create-sticky"
                                  onClick={() => {
                                    // Handle create skill functionality
                                    console.log('Create new skill')
                                    setSkillDropdownOpen(false)
                                  }}
                                >
                                  + Create Skill
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <label className="edit-radio-container">
                    <input 
                      type="radio" 
                      name="destination" 
                      className="edit-radio" 
                      checked={selectedDestination === 'contact-center'}
                      onChange={() => setSelectedDestination('contact-center')}
                    />
                    <span className="edit-radio-label">Contact Center/ Department/ Office/ Geo. Router</span>
                  </label>
                  <label className="edit-radio-container">
                    <input 
                      type="radio" 
                      name="destination" 
                      className="edit-radio" 
                      checked={selectedDestination === 'team-member'}
                      onChange={() => setSelectedDestination('team-member')}
                    />
                    <span className="edit-radio-label">Team Member</span>
                  </label>
                  <label className="edit-radio-container">
                    <input 
                      type="radio" 
                      name="destination" 
                      className="edit-radio" 
                      checked={selectedDestination === 'room-phone'}
                      onChange={() => setSelectedDestination('room-phone')}
                    />
                    <span className="edit-radio-label">Room Phone/ External Number</span>
                  </label>
                </div>
              </div>

              <div className="edit-section">
                <label className="edit-label">Operator fallback</label>
                <p className="edit-description">Choose what happens to the calls once the hold queue limit is reached or if no Agents are logged in during business hours.</p>
                <div className="edit-radio-group">
                  <label className="edit-radio-container">
                    <input type="radio" name="fallback" className="edit-radio" />
                    <span className="edit-radio-label">Message</span>
                  </label>
                  <label className="edit-radio-container">
                    <input type="radio" name="fallback" className="edit-radio" />
                    <span className="edit-radio-label">Voicemail</span>
                  </label>
                  <label className="edit-radio-container">
                    <input type="radio" name="fallback" className="edit-radio" />
                    <span className="edit-radio-label">Contact Center/ Department/ Office/ Geo. Router</span>
                  </label>
                  <label className="edit-radio-container">
                    <input type="radio" name="fallback" className="edit-radio" />
                    <span className="edit-radio-label">Team Member</span>
                  </label>
                  <label className="edit-radio-container">
                    <input type="radio" name="fallback" className="edit-radio" />
                    <span className="edit-radio-label">Room Phone/ External Number</span>
                  </label>
                </div>
              </div>
                </>
              )}
            </div>

            <div className="edit-drawer-footer">
              <button 
                className="edit-button edit-button-cancel"
                onClick={() => {
                  setEditingNodeId(null)
                  setSelectedSkill('')
                  setSkillDropdownOpen(false)
                  setSkillSelectionEnabled(false)
                }}
              >
                Cancel
              </button>
              <button 
                className="edit-button edit-button-update"
                onClick={() => {
                  if (editingNodeId) {
                    // Save destination
                    const destinationLabel = selectedDestination === 'operators' ? 'Operators' :
                                           selectedDestination === 'voicemail' ? 'Voicemail' :
                                           selectedDestination === 'contact-center' ? 'Contact Center' :
                                           selectedDestination === 'team-member' ? 'Team Member' :
                                           selectedDestination === 'room-phone' ? 'Room Phone' : '';
                    
                    if (destinationLabel) {
                      setNodeDestinations(prev => ({
                        ...prev,
                        [editingNodeId]: destinationLabel
                      }))
                    }
                    
                    // Save skill(s) if operators is selected and skill selection is enabled
                    if (selectedDestination === 'operators' && skillSelectionEnabled) {
                      if (multipleSkills && selectedSkills.length > 0) {
                        // Save multiple skills as comma-separated string
                        setNodeSkills(prev => ({
                          ...prev,
                          [editingNodeId]: selectedSkills.join(', ')
                        }))
                      } else if (!multipleSkills && selectedSkill) {
                        // Save single skill
                        setNodeSkills(prev => ({
                          ...prev,
                          [editingNodeId]: selectedSkill
                        }))
                      } else {
                        // Clear skills if none selected
                        setNodeSkills(prev => {
                          const newSkills = { ...prev }
                          delete newSkills[editingNodeId]
                          return newSkills
                        })
                      }
                    } else {
                      // Clear skill if not operators or skill selection disabled
                      setNodeSkills(prev => {
                        const newSkills = { ...prev }
                        delete newSkills[editingNodeId]
                        return newSkills
                      })
                    }
                  }
                  setEditingNodeId(null)
                  setSelectedSkill('')
                  setSkillDropdownOpen(false)
                  setSkillSelectionEnabled(false)
                }}
              >
                Update
              </button>
            </div>
        </div>
      )}

      {/* Add Step Sidebar */}
      {showAddStepSidebar && (
        <div className="edit-drawer add-step-drawer">
          <div className="edit-drawer-header">
            <h2 className="edit-drawer-title">Add step</h2>
            <button 
              className="edit-drawer-close"
              onClick={() => setShowAddStepSidebar(false)}
            >
              ×
            </button>
          </div>

          <div className="edit-drawer-content">
            <div className="edit-field-required">* required field</div>

            <div className="edit-section">
              <label className="edit-label">
                Type <span className="edit-required">*</span>
              </label>
              <div className="edit-type-grid">
                <button className="edit-type-option">Menu</button>
                <button className="edit-type-option">Collect</button>
                <button className="edit-type-option">Play</button>
                <button className="edit-type-option">Expert</button>
                <button className="edit-type-option">Branch</button>
                <button className="edit-type-option">Go-to</button>
                <button className="edit-type-option">Assign</button>
                <button className="edit-type-option">Customer Data</button>
                <button className="edit-type-option">Transfer</button>
                <button className="edit-type-option">Hangup</button>
                <button 
                  className={`edit-type-option ${selectedStepType === 'Skills' ? 'edit-type-selected' : ''}`}
                  onClick={() => setSelectedStepType('Skills')}
                >
                  Skills
                </button>
              </div>
            </div>

            {selectedStepType === 'Skills' && (
              <div className="edit-section">
                <label className="edit-label">
                  Name <span className="edit-required">*</span>
                </label>
                <input 
                  type="text"
                  className="edit-input"
                  placeholder="Enter skill node name"
                  value={newSkillNodeName}
                  onChange={(e) => setNewSkillNodeName(e.target.value)}
                />

                <div className="skill-selection-inline">
                  <div className="skill-selection-checkbox-container">
                    <input
                      type="checkbox"
                      id="select-skill-add"
                      className="skill-selection-checkbox"
                      checked={true}
                      readOnly
                    />
                    <span className="skill-selection-checkbox-label">Select skill</span>
                  </div>
                  
                  <p className="skill-selection-description">Select or type a skill.</p>
                  <div className="skill-dropdown-container">
                    <button 
                      className="skill-dropdown-button"
                      onClick={() => setSkillDropdownOpen(!skillDropdownOpen)}
                    >
                      {multipleSkills 
                        ? (selectedSkills.length > 0 ? `${selectedSkills.length} skills selected` : 'Select skills')
                        : (selectedSkill || 'Select skill')
                      }
                      <span className="skill-dropdown-arrow">▼</span>
                    </button>
                    {skillDropdownOpen && (
                      <div className="skill-dropdown-menu">
                        <div className="skill-dropdown-list">
                          {multipleSkills ? (
                            // Multiple selection with checkboxes
                            <>
                              {['Billing Support', 'Customer Service', 'Enterprise Customers', 'Payment Issues', 'Product XYZ Sales', 'Sales Support', 'Spanish', 'Subscription Management', 'Technical Support'].map((skill) => (
                                <label 
                                  key={skill}
                                  className="skill-dropdown-item skill-dropdown-checkbox-item"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedSkills.includes(skill)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedSkills([...selectedSkills, skill])
                                      } else {
                                        setSelectedSkills(selectedSkills.filter(s => s !== skill))
                                      }
                                    }}
                                  />
                                  {skill}
                                </label>
                              ))}
                              <div 
                                className="skill-dropdown-item skill-dropdown-create skill-dropdown-create-sticky"
                                onClick={() => {
                                  console.log('Create new skill')
                                  setSkillDropdownOpen(false)
                                }}
                              >
                                + Create Skill
                              </div>
                            </>
                          } else {
                            // Single selection
                            <>
                              <div 
                                className="skill-dropdown-item"
                                onClick={() => {
                                  setSelectedSkill('Billing Support')
                                  setSkillDropdownOpen(false)
                                }}
                              >
                                Billing Support
                              </div>
                              <div 
                                className="skill-dropdown-item"
                                onClick={() => {
                                  setSelectedSkill('Customer Service')
                                  setSkillDropdownOpen(false)
                                }}
                              >
                                Customer Service
                              </div>
                              <div 
                                className="skill-dropdown-item"
                                onClick={() => {
                                  setSelectedSkill('Enterprise Customers')
                                  setSkillDropdownOpen(false)
                                }}
                              >
                                Enterprise Customers
                              </div>
                              <div 
                                className="skill-dropdown-item"
                                onClick={() => {
                                  setSelectedSkill('Payment Issues')
                                  setSkillDropdownOpen(false)
                                }}
                              >
                                Payment Issues
                              </div>
                              <div 
                                className="skill-dropdown-item"
                                onClick={() => {
                                  setSelectedSkill('Product XYZ Sales')
                                  setSkillDropdownOpen(false)
                                }}
                              >
                                Product XYZ Sales
                              </div>
                              <div 
                                className="skill-dropdown-item"
                                onClick={() => {
                                  setSelectedSkill('Sales Support')
                                  setSkillDropdownOpen(false)
                                }}
                              >
                                Sales Support
                              </div>
                              <div 
                                className="skill-dropdown-item"
                                onClick={() => {
                                  setSelectedSkill('Spanish')
                                  setSkillDropdownOpen(false)
                                }}
                              >
                                Spanish
                              </div>
                              <div 
                                className="skill-dropdown-item"
                                onClick={() => {
                                  setSelectedSkill('Subscription Management')
                                  setSkillDropdownOpen(false)
                                }}
                              >
                                Subscription Management
                              </div>
                              <div 
                                className="skill-dropdown-item"
                                onClick={() => {
                                  setSelectedSkill('Technical Support')
                                  setSkillDropdownOpen(false)
                                }}
                              >
                                Technical Support
                              </div>
                              <div 
                                className="skill-dropdown-item skill-dropdown-create skill-dropdown-create-sticky"
                                onClick={() => {
                                  console.log('Create new skill')
                                  setSkillDropdownOpen(false)
                                }}
                              >
                                + Create Skill
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="edit-drawer-footer">
            <button 
              className="edit-button edit-button-cancel"
              onClick={() => setShowAddStepSidebar(false)}
            >
              Cancel
            </button>
            <button 
              className="edit-button edit-button-update"
              onClick={() => {
                if (selectedStepType === 'Skills' && newSkillNodeName.trim()) {
                  // Add skill node to tree
                  setSkillNodeAdded(true)
                  setSkillNodeName(newSkillNodeName.trim())
                  
                  // Save the skills for the new node
                  if (multipleSkills && selectedSkills.length > 0) {
                    setNodeSkills(prev => ({
                      ...prev,
                      'skill-node': selectedSkills.join(', ')
                    }))
                  } else if (!multipleSkills && selectedSkill) {
                    setNodeSkills(prev => ({
                      ...prev,
                      'skill-node': selectedSkill
                    }))
                  }
                  
                  // Reset form
                  setSelectedStepType('')
                  setNewSkillNodeName('')
                  setSelectedSkill('')
                  setSelectedSkills([])
                  setSkillDropdownOpen(false)
                }
                setShowAddStepSidebar(false)
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Prototype Settings */}
      <button 
        className="prototype-settings-button"
        onClick={() => setShowPrototypeSettings(!showPrototypeSettings)}
      >
        <span className="prototype-settings-icon">⚙️</span>
        Prototype Settings
        <span className="prototype-settings-arrow">{showPrototypeSettings ? '▲' : '▼'}</span>
      </button>

      {showPrototypeSettings && (
        <div className="prototype-settings-panel">
          <div className="prototype-settings-header">
            <h3>Prototype Settings</h3>
          </div>
          
          <div className="prototype-settings-section">
            <div className="prototype-settings-group-title">Main View</div>
            <select 
              className="prototype-settings-dropdown"
              value={mainView}
              onChange={(e) => setMainView(e.target.value)}
            >
              <option value="ivr-creation">IVR Creation</option>
              <option value="ivr-workflows">IVR Workflows</option>
            </select>
          </div>

          <div className="prototype-settings-section">
            <div className="prototype-settings-group-title">Skills Display</div>
            <label className="prototype-settings-radio-label">
              <input 
                type="radio" 
                name="skillsApproach"
                value="transfer-node"
                checked={skillsApproach === 'transfer-node'}
                onChange={(e) => setSkillsApproach(e.target.value)}
              />
              Skills in Transfer Node
            </label>
            <label className="prototype-settings-radio-label">
              <input 
                type="radio" 
                name="skillsApproach"
                value="new-skills-node"
                checked={skillsApproach === 'new-skills-node'}
                onChange={(e) => setSkillsApproach(e.target.value)}
              />
              New Skills Node
            </label>
          </div>

          <div className="prototype-settings-section">
            <label className="prototype-settings-label">
              <input 
                type="checkbox" 
                checked={skillBadgeTooltip}
                onChange={(e) => setSkillBadgeTooltip(e.target.checked)}
              />
              Skill badge tooltip
            </label>
            <label className="prototype-settings-label">
              <input 
                type="checkbox" 
                checked={multipleSkills}
                onChange={(e) => setMultipleSkills(e.target.checked)}
              />
              Multiple skills
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

export default App