import { useState, useEffect } from 'react'
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
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])  
  const [multipleSkills, setMultipleSkills] = useState(false)
  const [skillSearchTerm, setSkillSearchTerm] = useState('')
  const [customSkillInput, setCustomSkillInput] = useState('')
  const [showCustomSkillInput, setShowCustomSkillInput] = useState(false)
  const [skillSelectionEnabled, setSkillSelectionEnabled] = useState(false)
  const [skillLabelName, setSkillLabelName] = useState('')
  const [skillLabelValue, setSkillLabelValue] = useState('')
  const [showSkillValueDropdown, setShowSkillValueDropdown] = useState(false)
  const [nodeSkills, setNodeSkills] = useState<Record<string, string>>({})
  const [nodeDestinations, setNodeDestinations] = useState<Record<string, string>>({})
  const [nodeLabelPairs, setNodeLabelPairs] = useState<Record<string, {name: string, value: string}>>({})
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.skill-value-input-container')) {
        setShowSkillValueDropdown(false)
      }
    }
    
    if (showSkillValueDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSkillValueDropdown])
  const [showPrototypeSettings, setShowPrototypeSettings] = useState(false)
  const [skillBadgeTooltip, setSkillBadgeTooltip] = useState(false)
  const [skillsApproach, setSkillsApproach] = useState('transfer-node')
  const [showAddStepSidebar, setShowAddStepSidebar] = useState(false)
  const [selectedStepType, setSelectedStepType] = useState('')
  const [newSkillNodeName, setNewSkillNodeName] = useState('')
  const [skillNodeAdded, setSkillNodeAdded] = useState(false)
  const [skillNodeName, setSkillNodeName] = useState('')
  const [selectedContactCenter, setSelectedContactCenter] = useState('')
  const [contactCenterSkillEnabled, setContactCenterSkillEnabled] = useState(false)
  const [selectedFallback, setSelectedFallback] = useState('')
  
  // Grouped skills data structure
  const skillsData = {
    SKILLS: [
      'Billing Support',
      'Customer Service', 
      'Enterprise Customers',
      'Payment Issues',
      'Product XYZ Sales',
      'Sales Support',
      'Spanish',
      'Subscription Management',
      'Technical Support'
    ],
    VARIABLES: [
      'skill_route',
      'company_name',
      'customer_type'
    ],
    'SYSTEM VARIABLES': [
      'call.UUID',
      'caller.number',
      'called.number'
    ]
  }
  
  // Filter skills based on search term
  const getFilteredSkills = () => {
    if (!skillSearchTerm) return skillsData
    
    const filtered: typeof skillsData = { SKILLS: [], VARIABLES: [], 'SYSTEM VARIABLES': [] }
    
    Object.entries(skillsData).forEach(([category, items]) => {
      const filteredItems = items.filter(item => 
        item.toLowerCase().includes(skillSearchTerm.toLowerCase())
      )
      if (filteredItems.length > 0) {
        filtered[category as keyof typeof skillsData] = filteredItems
      }
    })
    
    return filtered
  }
  
  // Render skill value dropdown for label/value interface
  const renderSkillValueDropdown = () => {
    if (!showSkillValueDropdown) return null
    
    return (
      <div className="skill-value-dropdown">
        <div className="skill-dropdown-list">
          {Object.entries(skillsData).map(([category, items]) => {
            if (items.length === 0) return null
            
            return (
              <div key={category} className="skill-dropdown-group">
                <div className="skill-dropdown-group-header">{category}</div>
                {items.map((item) => (
                  <div 
                    key={item}
                    className="skill-dropdown-item"
                    onClick={() => {
                      setSkillLabelValue(item)
                      setShowSkillValueDropdown(false)
                    }}
                  >
                    <span className="skill-dropdown-item-text">— {item}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  // Reusable skill dropdown component
  const renderSkillDropdown = () => {
    if (!skillDropdownOpen) return null
    
    return (
      <div className="skill-dropdown-menu">
        {/* Search Input */}
        <div className="skill-dropdown-search">
          <input
            type="text"
            className="skill-search-input"
            placeholder="Search skills, variables..."
            value={skillSearchTerm}
            onChange={(e) => setSkillSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        {/* Custom Skill Input */}
        {showCustomSkillInput && (
          <div className="skill-dropdown-custom-input">
            <input
              type="text"
              className="skill-custom-input"
              placeholder="Enter custom skill or variable"
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && customSkillInput.trim()) {
                  if (multipleSkills) {
                    setSelectedSkills([...selectedSkills, customSkillInput.trim()])
                  } else {
                    setSelectedSkill(customSkillInput.trim())
                  }
                  setCustomSkillInput('')
                  setShowCustomSkillInput(false)
                  setSkillDropdownOpen(false)
                }
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
            <div className="skill-custom-actions">
              <button 
                className="skill-custom-add"
                onClick={(e) => {
                  e.stopPropagation()
                  if (customSkillInput.trim()) {
                    if (multipleSkills) {
                      setSelectedSkills([...selectedSkills, customSkillInput.trim()])
                    } else {
                      setSelectedSkill(customSkillInput.trim())
                    }
                    setCustomSkillInput('')
                    setShowCustomSkillInput(false)
                    setSkillDropdownOpen(false)
                  }
                }}
              >
                Add
              </button>
              <button 
                className="skill-custom-cancel"
                onClick={(e) => {
                  e.stopPropagation()
                  setCustomSkillInput('')
                  setShowCustomSkillInput(false)
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        <div className="skill-dropdown-list">
          {Object.entries(getFilteredSkills()).map(([category, items]) => {
            if (items.length === 0) return null
            
            return (
              <div key={category} className="skill-dropdown-group">
                <div className="skill-dropdown-group-header">{category}</div>
                {items.map((item) => (
                  multipleSkills ? (
                    <label 
                      key={item}
                      className="skill-dropdown-item skill-dropdown-checkbox-item"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(item)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSkills([...selectedSkills, item])
                          } else {
                            setSelectedSkills(selectedSkills.filter(s => s !== item))
                          }
                        }}
                      />
                      <span className="skill-dropdown-item-text">— {item}</span>
                    </label>
                  ) : (
                    <div 
                      key={item}
                      className="skill-dropdown-item"
                      onClick={() => {
                        setSelectedSkill(item)
                        setSkillDropdownOpen(false)
                      }}
                    >
                      <span className="skill-dropdown-item-text">— {item}</span>
                    </div>
                  )
                ))}
              </div>
            )
          })}
          
          {/* Add Custom Skill Option */}
          <div 
            className="skill-dropdown-item skill-dropdown-create skill-dropdown-create-sticky"
            onClick={(e) => {
              e.stopPropagation()
              setShowCustomSkillInput(true)
            }}
          >
            + Add custom skill or variable
          </div>
        </div>
      </div>
    )
  }
  
  // URL routing functions
  const getViewFromPath = () => {
    const path = window.location.pathname
    if (path === '/sbr/callcenters') return 'contact-centers'
    if (path === '/sbr/ivr-edit') return 'flow-builder'
    if (path === '/sbr/workflows') return 'workflow-list'
    return 'workflow-list' // default
  }

  const getDrawerStateFromURL = () => {
    const params = new URLSearchParams(window.location.search)
    return params.get('drawer') === 'call-routing'
  }

  const [currentView, setCurrentView] = useState(getViewFromPath()) // 'workflow-list', 'flow-builder', or 'contact-centers'

  // Navigation function that updates both state and URL
  const navigateToView = (view: string) => {
    setCurrentView(view)
    let path = '/sbr/'
    if (view === 'contact-centers') path = '/sbr/callcenters'
    else if (view === 'flow-builder') path = '/sbr/ivr-edit'
    else if (view === 'workflow-list') path = '/sbr/workflows'
    
    window.history.pushState({}, '', path)
  }

  // Function to update URL with drawer state
  const updateDrawerURL = (isOpen: boolean) => {
    const currentPath = window.location.pathname
    const params = new URLSearchParams(window.location.search)
    
    if (isOpen) {
      params.set('drawer', 'call-routing')
    } else {
      params.delete('drawer')
    }
    
    const queryString = params.toString()
    const newURL = currentPath + (queryString ? '?' + queryString : '')
    window.history.pushState({}, '', newURL)
  }
  const [openWorkflowMenu, setOpenWorkflowMenu] = useState<string | null>(null)
  const [skillFilter, setSkillFilter] = useState('')
  const [showWorkflowPrototypeSettings, setShowWorkflowPrototypeSettings] = useState(false)
  const [workflowMultipleSkills, setWorkflowMultipleSkills] = useState(false)
  const [selectedContactCenterId, setSelectedContactCenterId] = useState('cc-1')
  const [showCallRoutingDrawer, setShowCallRoutingDrawer] = useState(getDrawerStateFromURL())
  const [skillsBasedType, setSkillsBasedType] = useState('standard')
  const [agentRoutingType, setAgentRoutingType] = useState('skills-based')
  const [showCallRoutingPrototypeSettings, setShowCallRoutingPrototypeSettings] = useState(false)
  const [showRoutingOptionsInQueue, setShowRoutingOptionsInQueue] = useState(false)
  const [selectedRoutingCard, setSelectedRoutingCard] = useState('agents')
  const [selectedOtherRouting, setSelectedOtherRouting] = useState('voicemail')
  const [showWorkflowDropdown, setShowWorkflowDropdown] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState('')
  const [validateIvrSkills, setValidateIvrSkills] = useState(false)

  // Function to get missing skills for selected workflow
  const getMissingSkills = (workflowName: string): string[] => {
    const workflowSkills: Record<string, string[]> = {
      'Customer Support Main': ['Technical Support'],
      'Sales Inquiry': ['Sales'],
      'Billing Questions': ['Billing'],
      'Account Management': ['Account Management'],
      'Emergency Support': ['Priority Support']
    }
    
    // Simulate available agent skills (missing some skills to show the warning)
    const availableAgentSkills = ['Sales'] // Removed Technical Support to trigger warning for Customer Support Main
    
    const requiredSkills = workflowSkills[workflowName] || []
    return requiredSkills.filter((skill: string) => !availableAgentSkills.includes(skill))
  }

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getViewFromPath())
      setShowCallRoutingDrawer(getDrawerStateFromURL())
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Workflows data with multiple skills
  const allWorkflows = [
    { id: 'workflow-1', name: 'Customer Support Main Line', entryPoints: 4, skills: ['Customer Service'], user: 'John Davis', userInitials: 'JD', date: 'December 02, 2025' },
    { id: 'workflow-2', name: 'General Customer Inquiries', entryPoints: 3, skills: ['Customer Service', 'Spanish'], user: 'Sarah Wilson', userInitials: 'SW', date: 'November 30, 2025' },
    { id: 'workflow-3', name: 'Sales Inquiry Router', entryPoints: 3, skills: ['Sales Support'], user: 'Alice Martinez', userInitials: 'AM', date: 'November 28, 2025' },
    { id: 'workflow-4', name: 'Product Sales Pipeline', entryPoints: 2, skills: ['Sales Support', 'Enterprise Customers', 'Technical Support'], user: 'David Chen', userInitials: 'DC', date: 'November 26, 2025' },
    { id: 'workflow-5', name: 'Technical Support Queue', entryPoints: 2, skills: ['Technical Support'], user: 'Robert Wilson', userInitials: 'RW', date: 'November 25, 2025' },
    { id: 'workflow-6', name: 'IT Help Desk Flow', entryPoints: 4, skills: ['Technical Support', 'Billing Support'], user: 'Emma Thompson', userInitials: 'ET', date: 'November 23, 2025' },
    { id: 'workflow-7', name: 'Billing Department Flow', entryPoints: 5, skills: ['Billing Support'], user: 'Lisa Thompson', userInitials: 'LT', date: 'November 20, 2025' },
    { id: 'workflow-8', name: 'Payment Processing Center', entryPoints: 3, skills: ['Billing Support', 'Payment Issues'], user: 'Mark Johnson', userInitials: 'MJ', date: 'November 18, 2025' },
    { id: 'workflow-9', name: 'Enterprise Client Support', entryPoints: 6, skills: ['Enterprise Customers', 'Customer Service', 'Technical Support', 'Spanish'], user: 'Michael Johnson', userInitials: 'MJ', date: 'November 15, 2025' },
    { id: 'workflow-10', name: 'Corporate Account Management', entryPoints: 4, skills: ['Enterprise Customers'], user: 'Jennifer Lee', userInitials: 'JL', date: 'November 12, 2025' },
    { id: 'workflow-11', name: 'Spanish Language Support', entryPoints: 2, skills: ['Spanish'], user: 'Carlos Rodriguez', userInitials: 'CR', date: 'November 10, 2025' },
    { id: 'workflow-12', name: 'Multilingual Customer Care', entryPoints: 3, skills: ['Spanish', 'Customer Service'], user: 'Maria Garcia', userInitials: 'MG', date: 'November 08, 2025' },
    { id: 'workflow-13', name: 'Payment Issues Resolution', entryPoints: 2, skills: ['Payment Issues'], user: 'Alex Brown', userInitials: 'AB', date: 'November 05, 2025' },
    { id: 'workflow-14', name: 'Billing Dispute Handler', entryPoints: 4, skills: ['Payment Issues', 'Billing Support', 'Customer Service'], user: 'Rachel Green', userInitials: 'RG', date: 'November 03, 2025' },
    { id: 'workflow-15', name: 'Subscription Management Hub', entryPoints: 3, skills: ['Subscription Management'], user: 'Tom Wilson', userInitials: 'TW', date: 'November 01, 2025' },
    { id: 'workflow-16', name: 'Account Subscription Center', entryPoints: 5, skills: ['Subscription Management', 'Billing Support'], user: 'Lisa Chen', userInitials: 'LC', date: 'October 30, 2025' }
  ]

  // Filter workflows based on skill filter (works with multiple skills)
  const filteredWorkflows = skillFilter 
    ? allWorkflows.filter(workflow => workflow.skills.includes(skillFilter))
    : allWorkflows

  // Contact Centers data
  const contactCenters = [
    { id: 'cc-1', name: 'Enterprise Hub', status: 'Active', agents: 45, queues: 12 },
    { id: 'cc-2', name: 'Support Central', status: 'Active', agents: 18, queues: 6 },
    { id: 'cc-3', name: 'Sales Command', status: 'Inactive', agents: 32, queues: 10 },
    { id: 'cc-4', name: 'Global Operations', status: 'Active', agents: 67, queues: 15 },
    { id: 'cc-5', name: 'Regional Center', status: 'Active', agents: 28, queues: 9 }
  ]

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
                ) : (
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
            {nodeLabelPairs[id] && (
              <div className="ivr-label-badge">
                <span className="ivr-label-value">{nodeLabelPairs[id].value}</span>
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
              const existingLabelPair = nodeLabelPairs[id]
              
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
              
              // Load existing label name/value data
              if (existingLabelPair) {
                setContactCenterSkillEnabled(true)
                setSkillLabelName(existingLabelPair.name)
                setSkillLabelValue(existingLabelPair.value)
              } else {
                setContactCenterSkillEnabled(false)
                setSkillLabelName('')
                setSkillLabelValue('')
              }
              
              setSkillDropdownOpen(false)
              setShowSkillValueDropdown(false)
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

  // Contact Centers Component
  const renderContactCenters = () => (
    <div className="ivr-root contact-centers-view">
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
          
          <div className="sidebar-menu-section">
            <div className="sidebar-menu-item sidebar-menu-item-active">Contact Centers</div>
            <div className="sidebar-submenu">
              {contactCenters.map((cc) => (
                <div 
                  key={cc.id} 
                  className={`sidebar-submenu-item ${selectedContactCenterId === cc.id ? 'sidebar-submenu-active' : ''} sidebar-submenu-clickable`}
                  onClick={() => setSelectedContactCenterId(cc.id)}
                >
                  {cc.name}
                </div>
              ))}
            </div>
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
          
          <div className="sidebar-menu-item sidebar-menu-clickable" onClick={() => navigateToView('workflow-list')}>
            Channels & IVR <span className="sidebar-expand">+</span>
          </div>
          
          <div className="sidebar-menu-item">AI Scorecards</div>
          <div className="sidebar-menu-item">Billing</div>
          <div className="sidebar-menu-item">Dialpad AI</div>
          <div className="sidebar-menu-item">Privacy and Legal</div>
        </div>
      </aside>

      <main className="ivr-main">
        <header className="ivr-header">
          <div className="ivr-breadcrumb">
            <span>Contact Centers</span>
            <span> / </span>
            <span>{contactCenters.find(cc => cc.id === selectedContactCenterId)?.name}</span>
          </div>
        </header>

        <div className="contact-centers-content">
          <div className="call-routing-section">
            <div className="call-routing-header">
              <div className="call-routing-title">
                <h2>Call Routing</h2>
                <button className="edit-call-routing-button" onClick={() => {
                  setShowCallRoutingDrawer(true)
                  updateDrawerURL(true)
                }}>Edit Call Routing</button>
              </div>
              <p>Determine how calls are routed during open and closed business hours.</p>
            </div>
            
            <div className="call-routing-priority">
              <div className="priority-checkbox">
                <input type="checkbox" id="priority-routing" defaultChecked />
                <label htmlFor="priority-routing">Prioritize call routing to the last agent who handled that contact.</label>
              </div>
              <p className="priority-description">If that agent is unavailable, the call is routed based on the configured business and holiday hours routing rules.</p>
            </div>

            <div className="routing-configuration">
              <h3>Routing configuration</h3>
              <div className="routing-table">
                <div className="routing-table-header">
                  <div className="routing-col-availability">AVAILABILITY</div>
                  <div className="routing-col-rules">RULES</div>
                </div>
                <div className="routing-table-row">
                  <div className="routing-col-availability">Open hours routing</div>
                  <div className="routing-col-rules">Route to agents: Skills-based</div>
                </div>
                <div className="routing-table-row">
                  <div className="routing-col-availability">Closed hours routing</div>
                  <div className="routing-col-rules">Route to agents: Skills-based</div>
                </div>
              </div>
            </div>
          </div>

          <div className="holiday-hours-section">
            <div className="holiday-hours-header">
              <div className="holiday-hours-title">
                <h2>Holiday Hours</h2>
                <button className="add-holiday-button">Add Holiday</button>
              </div>
              <p>Apply holiday hours to override normal business hours.</p>
            </div>

            <div className="holiday-hours-table">
              <div className="holiday-table-header">
                <div className="holiday-col-name">HOLIDAY</div>
                <div className="holiday-col-date">DATE</div>
                <div className="holiday-col-repeat">REPEAT</div>
                <div className="holiday-col-owner">OWNER</div>
                <div className="holiday-col-actions"></div>
              </div>
              <div className="holiday-table-row">
                <div className="holiday-col-name">
                  <div className="holiday-name">AASheeba</div>
                  <div className="holiday-template">Created via template</div>
                </div>
                <div className="holiday-col-date">December 1, 2026</div>
                <div className="holiday-col-repeat">Annually on same date</div>
                <div className="holiday-col-owner">Office</div>
                <div className="holiday-col-actions">
                  <button className="holiday-options-button">Options</button>
                </div>
              </div>
            </div>
          </div>

          <div className="additional-sections">
            <div className="section-item">
              <h2>AI Settings</h2>
            </div>

            <div className="section-item">
              <h2>Integrations</h2>
            </div>

            <div className="section-item">
              <h2>CSAT surveys</h2>
            </div>
          </div>
        </div>
      </main>

      {/* Call Routing Drawer */}
      {showCallRoutingDrawer && (
        <div className="drawer-overlay" onClick={() => {
          setShowCallRoutingDrawer(false)
          updateDrawerURL(false)
        }}>
          <div className="call-routing-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Call Routing</h2>
              <button className="drawer-close" onClick={() => {
                setShowCallRoutingDrawer(false)
                updateDrawerURL(false)
              }}>×</button>
            </div>
            
            <div className="drawer-content">
              <p className="drawer-subtitle">Set rules for the call routing during open and closed hours</p>
              
              <div className="routing-tabs">
                <button className="routing-tab routing-tab-active">OPEN HOURS ROUTING</button>
                <button className="routing-tab">CLOSED HOURS ROUTING</button>
              </div>

              <div className="priority-section">
                <div className="priority-checkbox">
                  <input type="checkbox" id="drawer-priority-routing" defaultChecked />
                  <label htmlFor="drawer-priority-routing">Prioritize call routing to the last agent who handled that contact.</label>
                </div>
                <p className="priority-description">If that agent is unavailable, the call is routed based on the configured business and holiday hours routing rules.</p>
              </div>

              <div className="routing-options-section">
                <h3>Routing Options</h3>
                <p className="routing-options-description">Ensure calls are routed to the right team every time. Select a routing option below to fit your business' needs. Don't forget, you can come back and readjust anytime.</p>
                
                <div className="routing-cards">
                  <div 
                    className={`routing-card ${selectedRoutingCard === 'agents' ? 'routing-card-selected' : ''}`}
                    onClick={() => setSelectedRoutingCard('agents')}
                  >
                    <h4>Send calls to:</h4>
                    <h3>Agents</h3>
                    <p>Longest idle, round robin, skills-based, and more.</p>
                  </div>
                  <div 
                    className={`routing-card ${selectedRoutingCard === 'other' ? 'routing-card-selected' : ''}`}
                    onClick={() => setSelectedRoutingCard('other')}
                  >
                    <h4>Other routing options</h4>
                    <p>Voicemail, another number, IVR workflow, and more.</p>
                  </div>
                </div>

                {selectedRoutingCard === 'agents' && (
                  <div className="agent-routing-section">
                    <h4>Choose agent routing type:</h4>
                  <div className="routing-radio-options">
                    <label className="routing-radio-label">
                      <input 
                        type="radio" 
                        name="agentRouting" 
                        value="longest-idle" 
                        checked={agentRoutingType === 'longest-idle'}
                        onChange={(e) => setAgentRoutingType(e.target.value)}
                      />
                      <div className="routing-radio-content">
                        <span>Longest idle</span>
                      </div>
                    </label>
                    <label className="routing-radio-label">
                      <input 
                        type="radio" 
                        name="agentRouting" 
                        value="fixed-order" 
                        checked={agentRoutingType === 'fixed-order'}
                        onChange={(e) => setAgentRoutingType(e.target.value)}
                      />
                      <div className="routing-radio-content">
                        <span>Fixed order</span>
                      </div>
                    </label>
                    <label className="routing-radio-label">
                      <input 
                        type="radio" 
                        name="agentRouting" 
                        value="round-robin" 
                        checked={agentRoutingType === 'round-robin'}
                        onChange={(e) => setAgentRoutingType(e.target.value)}
                      />
                      <div className="routing-radio-content">
                        <span>Round robin</span>
                      </div>
                    </label>
                    <label className="routing-radio-label">
                      <input 
                        type="radio" 
                        name="agentRouting" 
                        value="random" 
                        checked={agentRoutingType === 'random'}
                        onChange={(e) => setAgentRoutingType(e.target.value)}
                      />
                      <div className="routing-radio-content">
                        <span>Random</span>
                      </div>
                    </label>
                    <label className="routing-radio-label">
                      <input 
                        type="radio" 
                        name="agentRouting" 
                        value="skills-based" 
                        checked={agentRoutingType === 'skills-based'}
                        onChange={(e) => setAgentRoutingType(e.target.value)}
                      />
                      <div className="routing-radio-content">
                        <span>Skills-based</span>
                        
                        {agentRoutingType === 'skills-based' && (
                          <div className="nested-routing-options">
                          <label className="nested-routing-radio-label">
                            <input 
                              type="radio" 
                              name="skillsBasedType" 
                              value="standard" 
                              checked={skillsBasedType === 'standard'}
                              onChange={(e) => setSkillsBasedType(e.target.value)}
                            />
                            <div className="nested-routing-content">
                              <span>Standard routing</span>
                              <p className="routing-option-description">Agents are rang from highest to lowest skill level.</p>
                              <a href="#" className="routing-option-link">Rate your Agents</a>
                            </div>
                          </label>
                          
                          <label className="nested-routing-radio-label">
                            <input 
                              type="radio" 
                              name="skillsBasedType" 
                              value="advanced" 
                              checked={skillsBasedType === 'advanced'}
                              onChange={(e) => setSkillsBasedType(e.target.value)}
                            />
                            <div className="nested-routing-content">
                              <span>Advanced skills-based routing</span>
                              <p className="routing-option-description">Uses skill priority, proficiency levels, and bullseye routing.</p>
                              
                              {skillsBasedType === 'advanced' && showRoutingOptionsInQueue && (
                                <div className="routing-options-link-container">
                                  <a 
                                    href="#advanced-routing-options" 
                                    className="routing-options-link"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const element = document.getElementById('advanced-routing-options');
                                      if (element) {
                                        element.scrollIntoView({ behavior: 'smooth' });
                                      }
                                    }}
                                  >
                                    Advanced routing options
                                  </a>
                                </div>
                              )}
                              
                              {skillsBasedType === 'advanced' && !showRoutingOptionsInQueue && (
                                <div className="bullseye-rings-section">
                                  <h5>Bullseye Rings</h5>
                                  <p className="routing-option-description">Define how strict skill requirements relax over time.</p>
                                  
                                  <div className="bullseye-routing-types">
                                    <label className="bullseye-radio-label">
                                      <input type="radio" name="bullseyeRouting" value="enforced" defaultChecked />
                                      <div className="bullseye-radio-content">
                                        <span>enforced skill routing</span>
                                        <p className="routing-option-description">Only agents with the required skill can receive the call. If no skilled agents are available, the call waits in the queue.</p>
                                      </div>
                                    </label>
                                    
                                    <label className="bullseye-radio-label">
                                      <input type="radio" name="bullseyeRouting" value="relaxed" />
                                      <div className="bullseye-radio-content">
                                        <span>relaxed/best effort skill routing</span>
                                        <p className="routing-option-description">Relaxes skill requirements over time, allowing calls to be routed to any available agent if no skilled agents are available.</p>
                                      </div>
                                    </label>
                                  </div>

                                  <div className="proficiency-relaxation-section">
                                    <h6>Proficiency relaxation rules</h6>
                                    
                                    <div className="proficiency-rule">
                                      <span className="rule-label">After</span>
                                      <input type="number" className="time-input" defaultValue="10" min="1" max="999" />
                                      <span className="time-unit">min</span>
                                      <span className="rule-description">Proficiency from 80-100</span>
                                    </div>
                                    
                                    <div className="proficiency-rule">
                                      <span className="rule-label">After</span>
                                      <input type="number" className="time-input" defaultValue="10" min="1" max="999" />
                                      <span className="time-unit">min</span>
                                      <span className="rule-description">Proficiency from 50-100</span>
                                    </div>
                                    
                                    <div className="proficiency-rule">
                                      <span className="rule-label">After</span>
                                      <input type="number" className="time-input" defaultValue="10" min="1" max="999" />
                                      <span className="time-unit">min</span>
                                      <span className="rule-description">Any proficiency</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </label>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
                )}

                {selectedRoutingCard === 'other' && (
                  <div className="other-routing-section">
                    <h4>Calls will be sent:</h4>
                    <div className="routing-radio-options">
                      <label className="routing-radio-label">
                        <input 
                          type="radio" 
                          name="otherRouting" 
                          value="voicemail" 
                          checked={selectedOtherRouting === 'voicemail'}
                          onChange={(e) => setSelectedOtherRouting(e.target.value)}
                        />
                        <div className="routing-radio-content">
                          <span>Directly to voicemail ( Agents will receive notifications when voicemails are left )</span>
                        </div>
                      </label>
                      
                      <label className="routing-radio-label">
                        <input 
                          type="radio" 
                          name="otherRouting" 
                          value="message" 
                          checked={selectedOtherRouting === 'message'}
                          onChange={(e) => setSelectedOtherRouting(e.target.value)}
                        />
                        <div className="routing-radio-content">
                          <span>To a message (no voicemail)</span>
                        </div>
                      </label>
                      
                      <label className="routing-radio-label">
                        <input 
                          type="radio" 
                          name="otherRouting" 
                          value="department" 
                          checked={selectedOtherRouting === 'department'}
                          onChange={(e) => setSelectedOtherRouting(e.target.value)}
                        />
                        <div className="routing-radio-content">
                          <span>To another department, office, contact center or geo. router</span>
                        </div>
                      </label>
                      
                      <label className="routing-radio-label">
                        <input 
                          type="radio" 
                          name="otherRouting" 
                          value="team-member" 
                          checked={selectedOtherRouting === 'team-member'}
                          onChange={(e) => setSelectedOtherRouting(e.target.value)}
                        />
                        <div className="routing-radio-content">
                          <span>To a team member, room phone, or external number</span>
                        </div>
                      </label>
                      
                      <label className="routing-radio-label">
                        <input 
                          type="radio" 
                          name="otherRouting" 
                          value="automated-response" 
                          checked={selectedOtherRouting === 'automated-response'}
                          onChange={(e) => setSelectedOtherRouting(e.target.value)}
                        />
                        <div className="routing-radio-content">
                          <span>To an automated response menu</span>
                        </div>
                      </label>
                      
                      <label className="routing-radio-label">
                        <input 
                          type="radio" 
                          name="otherRouting" 
                          value="ivr-workflow" 
                          checked={selectedOtherRouting === 'ivr-workflow'}
                          onChange={(e) => setSelectedOtherRouting(e.target.value)}
                        />
                        <div className="routing-radio-content">
                          <span>To an IVR workflow</span>
                          {selectedOtherRouting === 'ivr-workflow' && (
                            <div className="workflow-selection">
                              <div className="workflow-dropdown-container">
                                <input 
                                  type="text" 
                                  placeholder="Search IVR workflows by name..."
                                  value={selectedWorkflow}
                                  onChange={(e) => setSelectedWorkflow(e.target.value)}
                                  className="workflow-search-input"
                                  onFocus={() => setShowWorkflowDropdown(true)}
                                  onBlur={() => setTimeout(() => setShowWorkflowDropdown(false), 200)}
                                />
                                {showWorkflowDropdown && (
                                  <div className="workflow-dropdown">
                                    <div className="workflow-option" onClick={() => {
                                      setSelectedWorkflow('Customer Support Main');
                                      setShowWorkflowDropdown(false);
                                    }}>
                                      <span className="workflow-name">Customer Support Main</span>
                                      <span className="workflow-skill-badge">Technical Support</span>
                                    </div>
                                    <div className="workflow-option" onClick={() => {
                                      setSelectedWorkflow('Sales Inquiry');
                                      setShowWorkflowDropdown(false);
                                    }}>
                                      <span className="workflow-name">Sales Inquiry</span>
                                      <span className="workflow-skill-badge">Sales</span>
                                    </div>
                                    <div className="workflow-option" onClick={() => {
                                      setSelectedWorkflow('Billing Questions');
                                      setShowWorkflowDropdown(false);
                                    }}>
                                      <span className="workflow-name">Billing Questions</span>
                                      <span className="workflow-skill-badge">Billing</span>
                                    </div>
                                    <div className="workflow-option" onClick={() => {
                                      setSelectedWorkflow('Product Demo Request');
                                      setShowWorkflowDropdown(false);
                                    }}>
                                      <span className="workflow-name">Product Demo Request</span>
                                    </div>
                                    <div className="workflow-option" onClick={() => {
                                      setSelectedWorkflow('Account Management');
                                      setShowWorkflowDropdown(false);
                                    }}>
                                      <span className="workflow-name">Account Management</span>
                                      <span className="workflow-skill-badge">Account Management</span>
                                    </div>
                                    <div className="workflow-option" onClick={() => {
                                      setSelectedWorkflow('General Inquiry');
                                      setShowWorkflowDropdown(false);
                                    }}>
                                      <span className="workflow-name">General Inquiry</span>
                                    </div>
                                    <div className="workflow-option" onClick={() => {
                                      setSelectedWorkflow('Emergency Support');
                                      setShowWorkflowDropdown(false);
                                    }}>
                                      <span className="workflow-name">Emergency Support</span>
                                      <span className="workflow-skill-badge">Priority Support</span>
                                    </div>
                                  </div>
                                )}
                                
                                {validateIvrSkills && selectedWorkflow && getMissingSkills(selectedWorkflow).length > 0 && (
                                  <div className="skill-validation-warning">
                                    <div className="warning-icon">⚠</div>
                                    <div className="warning-content">
                                      <div className="warning-title">
                                        The selected IVR flow has skills assigned that the current CC does not have. Assign another IVR flow or assign agents with the skills to continue
                                      </div>
                                      <div className="warning-skills">
                                        Missing skills: {getMissingSkills(selectedWorkflow).join(', ')}
                                      </div>
                                      <div className="warning-actions">
                                        <button className="manage-skills-btn">
                                          Manage agent skills
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                      
                      <label className="routing-radio-label">
                        <input 
                          type="radio" 
                          name="otherRouting" 
                          value="ai-agent" 
                          checked={selectedOtherRouting === 'ai-agent'}
                          onChange={(e) => setSelectedOtherRouting(e.target.value)}
                        />
                        <div className="routing-radio-content">
                          <span>To an AI agent</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                <div className="welcome-greeting-section">
                  <div className="section-separator"></div>
                  
                  <h3>Open Hours Welcome Greeting</h3>
                  <p className="welcome-greeting-description">A welcome greeting is the first greeting that callers hear when they reach the contact center.</p>
                  
                  <div className="greeting-controls">
                    <div className="greeting-dropdown-container">
                      <select className="greeting-dropdown">
                        <option>Custom Text-to-Speech</option>
                        <option>Upload Audio</option>
                        <option>Record Greeting</option>
                      </select>
                    </div>
                    
                    <div className="greeting-actions">
                      <button className="greeting-action-btn play-btn" title="Play">▶</button>
                      <button className="greeting-action-btn edit-btn" title="Edit">✏</button>
                      <button className="greeting-action-btn download-btn" title="Download">↓</button>
                      <button className="greeting-action-btn delete-btn" title="Delete">🗑</button>
                    </div>
                  </div>
                  
                  <div className="greeting-options">
                    <button className="greeting-option-btn record-btn">
                      <span className="btn-icon">●</span>
                      Record a greeting
                    </button>
                    <button className="greeting-option-btn upload-btn">
                      <span className="btn-icon">↑</span>
                      Upload (.mp3)
                    </button>
                  </div>
                </div>

                <div className="ring-duration-section">
                  <div className="section-separator"></div>
                  
                  <h3>Ring Duration</h3>
                  
                  <div className="ring-duration-notice">
                    <p>Changes made here will be reflected in both Open and Closed Hours</p>
                  </div>
                  
                  <p className="ring-duration-description">
                    Choose how long an agent will ring before Dialpad assumes the agent is not available, and the call is returned to the hold queue. (default 30s)
                  </p>
                  
                  <div className="ring-duration-control">
                    <div className="duration-value">30s</div>
                    <div className="duration-slider-container">
                      <input 
                        type="range" 
                        className="duration-slider" 
                        min="10" 
                        max="45" 
                        defaultValue="30" 
                      />
                      <div className="slider-labels">
                        <span>10s</span>
                        <span>45s</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hold-queue-section">
                  <div className="section-separator"></div>
                  
                  <h3>Hold Queue</h3>
                  
                  <div className="hold-queue-notice">
                    <p>Changes made here will be reflected in both Open and Closed Hours</p>
                  </div>
                  
                  <p className="hold-queue-description">
                    If all operators are busy on other calls, send callers to a hold queue.
                  </p>
                  
                  <div className="hold-queue-settings">
                    <div className="queue-setting-group">
                      <h4>Hold queue size</h4>
                      <p className="setting-description">Specify your queue size and wait time.</p>
                      
                      <div className="queue-size-control">
                        <label>Maximum queue size (Limit: 1 to 1000)</label>
                        <div className="input-with-unit">
                          <input type="number" className="queue-input" defaultValue="50" />
                          <span className="input-unit">People</span>
                        </div>
                      </div>
                      
                      <div className="queue-wait-control">
                        <label>Maximum queue wait time (Limit: 10 Seconds to 300 Minutes)</label>
                        <div className="time-inputs">
                          <input type="number" className="time-input-field" defaultValue="15" />
                          <span>Minutes</span>
                          <input type="number" className="time-input-field" defaultValue="0" />
                          <span>Seconds</span>
                        </div>
                      </div>
                      
                      <div className="announcement-control">
                        <label>Hold announcement interval</label>
                        <div className="time-inputs">
                          <input type="number" className="time-input-field" defaultValue="2" />
                          <span>Minutes</span>
                          <input type="number" className="time-input-field" defaultValue="0" />
                          <span>Seconds</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="queue-setting-group">
                      <h4>Hold greeting</h4>
                      <p className="setting-description">Select the greeting callers hear when they are placed on hold. This greeting plays once before the hold music begins.</p>
                      
                      <div className="greeting-controls">
                        <select className="greeting-dropdown">
                          <option>Default Hold Intro</option>
                          <option>Custom Text-to-Speech</option>
                          <option>Upload Audio</option>
                        </select>
                        <button className="greeting-action-btn play-btn" title="Play">▶</button>
                      </div>
                      
                      <div className="greeting-options">
                        <button className="greeting-option-btn record-btn">
                          <span className="btn-icon">●</span>
                          Record a greeting
                        </button>
                        <button className="greeting-option-btn upload-btn">
                          <span className="btn-icon">↑</span>
                          Upload (.mp3)
                        </button>
                      </div>
                      
                      <div className="delay-greeting-option">
                        <label className="checkbox-label">
                          <input type="checkbox" />
                          <span>Enable Delay greeting</span>
                        </label>
                        <p className="option-description">A greeting that is played every configured minutes while callers are in the hold queue.</p>
                        
                        <div className="delay-greeting-dropdown">
                          <select className="greeting-dropdown">
                            <option>No Greeting</option>
                            <option>Custom Text-to-Speech</option>
                            <option>Upload Audio</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="queue-setting-group">
                      <h4>Advanced hold queue settings</h4>
                      
                      <div className="advanced-option">
                        <label className="checkbox-label">
                          <input type="checkbox" defaultChecked />
                          <span>Allow callers to be placed in your hold queue when no agents are available</span>
                        </label>
                        <p className="option-description">Callers will be placed in your hold queue even if no agents are on duty. Make sure you have set a hold queue limit to avoid long wait times.</p>
                      </div>
                      
                      <div className="advanced-option">
                        <label className="checkbox-label">
                          <input type="checkbox" />
                          <span>Allow existing calls to stay in queue after contact center has closed</span>
                        </label>
                        <p className="option-description">Turn this on to allow agents to answer calls that were in your queue before the contact center closed. Note that calls will still respect maximum queue wait time defined above.</p>
                      </div>
                      
                      <div className="advanced-option">
                        <label className="checkbox-label">
                          <input type="checkbox" defaultChecked />
                          <span>Let callers know their place in the queue</span>
                        </label>
                        <p className="option-description">This option is not available when a maximum queue wait time of less than 2 minutes is selected.</p>
                      </div>
                      
                      <div className="advanced-option">
                        <label className="checkbox-label">
                          <input type="checkbox" />
                          <span>Let callers know their estimated wait time. Maximum time to announce:</span>
                        </label>
                        <div className="inline-input">
                          <input type="text" className="time-input-inline" defaultValue="30 minutes" />
                        </div>
                        <p className="option-description">Announces the estimated wait time to callers while they are in queue and if it exceeds the maximum time selected, callers will be told their wait time is longer than the maximum time set.</p>
                      </div>
                      
                      <div className="advanced-option">
                        <label className="checkbox-label">
                          <input type="checkbox" defaultChecked />
                          <span>Allow callers to exit the hold queue to voicemail by pressing:</span>
                        </label>
                        <div className="inline-input">
                          <select className="number-dropdown">
                            <option>9</option>
                            <option>0</option>
                            <option>1</option>
                            <option>2</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="advanced-option">
                        <label className="checkbox-label">
                          <input type="checkbox" defaultChecked />
                          <span>Allow callers to request a callback when the queue has more than</span>
                        </label>
                        <div className="inline-inputs">
                          <input type="number" className="number-input-small" defaultValue="0" />
                          <span>calls by pressing:</span>
                          <select className="number-dropdown">
                            <option>0</option>
                            <option>1</option>
                            <option>2</option>
                            <option>9</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="advanced-option">
                        <label className="checkbox-label">
                          <input type="checkbox" />
                          <span>Connect to agent before calling back customers</span>
                        </label>
                      </div>
                      
                      {showRoutingOptionsInQueue && (
                        <div className="routing-options-in-queue" id="advanced-routing-options">
                          <div className="section-separator" style={{margin: '24px 0'}}></div>
                          <h5>Advanced Routing Options</h5>
                          <p className="routing-option-description">Define how strict skill requirements relax over time.</p>
                          
                          <div className="bullseye-routing-types">
                            <label className="bullseye-radio-label">
                              <input type="radio" name="bullseyeRoutingQueue" value="enforced" defaultChecked />
                              <div className="bullseye-radio-content">
                                <span>enforced skill routing</span>
                                <p className="routing-option-description">Only agents with the required skill can receive the call. If no skilled agents are available, the call waits in the queue.</p>
                              </div>
                            </label>
                            
                            <label className="bullseye-radio-label">
                              <input type="radio" name="bullseyeRoutingQueue" value="relaxed" />
                              <div className="bullseye-radio-content">
                                <span>relaxed/best effort skill routing</span>
                                <p className="routing-option-description">Relaxes skill requirements over time, allowing calls to be routed to any available agent if no skilled agents are available.</p>
                              </div>
                            </label>
                          </div>

                          <div className="proficiency-relaxation-section">
                            <h6>Proficiency relaxation rules</h6>
                            
                            <div className="proficiency-rule">
                              <span className="rule-label">After</span>
                              <input type="number" className="time-input" defaultValue="10" min="1" max="999" />
                              <span className="time-unit">min</span>
                              <span className="rule-description">Proficiency from 80-100</span>
                            </div>
                            
                            <div className="proficiency-rule">
                              <span className="rule-label">After</span>
                              <input type="number" className="time-input" defaultValue="10" min="1" max="999" />
                              <span className="time-unit">min</span>
                              <span className="rule-description">Proficiency from 50-100</span>
                            </div>
                            
                            <div className="proficiency-rule">
                              <span className="rule-label">After</span>
                              <input type="number" className="time-input" defaultValue="10" min="1" max="999" />
                              <span className="time-unit">min</span>
                              <span className="rule-description">Any proficiency</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prototype Settings Button for Call Routing Drawer */}
            <div className="call-routing-prototype-settings">
              <button 
                className="prototype-settings-button"
                onClick={() => setShowCallRoutingPrototypeSettings(!showCallRoutingPrototypeSettings)}
              >
                <span className="settings-icon">⚙</span>
                Prototype Settings
              </button>
              
              {showCallRoutingPrototypeSettings && (
                <div className="prototype-settings-panel">
                  <div className="prototype-setting">
                    <label className="prototype-settings-label">
                      <input 
                        type="checkbox" 
                        checked={showRoutingOptionsInQueue}
                        onChange={(e) => setShowRoutingOptionsInQueue(e.target.checked)}
                      />
                      <span>Show routing options in Advanced hold queue settings</span>
                    </label>
                  </div>
                  <div className="prototype-setting">
                    <label className="prototype-settings-label">
                      <input 
                        type="checkbox" 
                        checked={validateIvrSkills}
                        onChange={(e) => setValidateIvrSkills(e.target.checked)}
                      />
                      <span>Validate IVR & CC skills</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Workflow List Component
  const renderWorkflowList = () => (
    <div className="ivr-root workflow-list">
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
          
          <div className="sidebar-menu-item sidebar-submenu-clickable" onClick={() => navigateToView('contact-centers')}>
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
              <span>ADMIN / DIALPAD, INC. (BETA) / DIALPADBETA / IVR WORKFLOWS</span>
            </div>
            <div className="ivr-title-row">
              <h1 className="ivr-title">IVR Workflows</h1>
              <div className="ivr-subtitle">Manages IVR workflows for Dialpadbeta. <a href="#" className="ivr-link">Learn More</a></div>
            </div>
          </div>
          <div className="ivr-header-right">
            <button 
              type="button" 
              className="ivr-button ivr-button-primary"
              onClick={() => navigateToView('flow-builder')}
            >
              Create workflow
            </button>
          </div>
        </header>

        <div className="workflow-tabs">
          <button className="workflow-tab workflow-tab-active">IVR workflows</button>
          <button className="workflow-tab">Media</button>
          <button className="workflow-tab">Speech</button>
        </div>

        <div className="workflow-filters">
          <input 
            type="text" 
            placeholder="Search workflows" 
            className="workflow-search-input"
          />
          <select className="workflow-filter-dropdown">
            <option value="">Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>
          <select 
            className="workflow-filter-dropdown"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
          >
            <option value="">All Skills</option>
            <option value="Billing Support">Billing Support</option>
            <option value="Customer Service">Customer Service</option>
            <option value="Enterprise Customers">Enterprise Customers</option>
            <option value="Payment Issues">Payment Issues</option>
            <option value="Product XYZ Sales">Product XYZ Sales</option>
            <option value="Sales Support">Sales Support</option>
            <option value="Spanish">Spanish</option>
            <option value="Subscription Management">Subscription Management</option>
            <option value="Technical Support">Technical Support</option>
          </select>
          <select className="workflow-filter-dropdown">
            <option value="">Type</option>
            <option value="customer-support">Customer Support</option>
            <option value="sales">Sales</option>
            <option value="billing">Billing</option>
            <option value="technical">Technical</option>
          </select>
        </div>

        <div className="workflow-table-container">
          <table className="workflow-table">
            <thead>
              <tr>
                <th>Name ↕</th>
                <th>Entry points ↕</th>
                <th>Skills ↕</th>
                <th>Last edited by ↕</th>
                <th>Date edited ↕</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkflows.map((workflow) => (
                <tr key={workflow.id} className="workflow-row">
                  <td>
                    <a href="#" className="workflow-link">{workflow.name}</a>
                  </td>
                  <td>{workflow.entryPoints}</td>
                  <td>
                    {workflowMultipleSkills ? (
                      <div className="workflow-skills-container">
                        {workflow.skills.slice(0, 2).map((skill, index) => (
                          <span key={index} className="workflow-skill-badge">{skill}</span>
                        ))}
                        {workflow.skills.length > 2 && (
                          <span 
                            className="workflow-skill-badge workflow-skill-badge-more"
                            title={workflow.skills.slice(2).join(', ')}
                          >
                            +{workflow.skills.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="workflow-skill-badge">{workflow.skills[0]}</span>
                    )}
                  </td>
                  <td>
                    <div className="workflow-user">
                      <div className="workflow-avatar workflow-avatar-multi">{workflow.userInitials}</div>
                      <span>{workflow.user}</span>
                    </div>
                  </td>
                  <td>{workflow.date}</td>
                  <td className="workflow-menu-cell">
                    <button 
                      className="workflow-menu-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenWorkflowMenu(openWorkflowMenu === workflow.id ? null : workflow.id)
                      }}
                    >
                      ⋯
                    </button>
                    {openWorkflowMenu === workflow.id && (
                      <div className="workflow-dropdown-menu">
                        <button className="workflow-dropdown-item" onClick={() => {
                          console.log('Details clicked for', workflow.name)
                          setOpenWorkflowMenu(null)
                        }}>
                          Details
                        </button>
                        <button className="workflow-dropdown-item" onClick={() => {
                          console.log('Copy clicked for', workflow.name)
                          setOpenWorkflowMenu(null)
                        }}>
                          Copy
                        </button>
                        <button className="workflow-dropdown-item" onClick={() => {
                          setCurrentView('flow-builder')
                          setOpenWorkflowMenu(null)
                        }}>
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="prototype-settings-container">
          <button 
            className="prototype-settings-button"
            onClick={() => setShowWorkflowPrototypeSettings(!showWorkflowPrototypeSettings)}
          >
            <span className="prototype-settings-icon">⚙</span>
            Prototype Settings
            <span className="prototype-settings-arrow">▼</span>
          </button>
          {showWorkflowPrototypeSettings && (
            <div className="prototype-settings-panel">
              <div className="prototype-settings-header">
                <h3>Prototype Settings</h3>
                <p>Configure prototype behavior for the workflow table</p>
              </div>
              <div className="prototype-settings-section">
                <label className="prototype-settings-label">
                  <input 
                    type="checkbox" 
                    checked={workflowMultipleSkills}
                    onChange={(e) => setWorkflowMultipleSkills(e.target.checked)}
                  />
                  <span>Multiple skills</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )

  // Conditional rendering based on current view
  if (currentView === 'workflow-list') {
    return renderWorkflowList()
  }

  if (currentView === 'contact-centers') {
    return renderContactCenters()
  }

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
          
          <div className="sidebar-menu-item sidebar-submenu-clickable" onClick={() => navigateToView('contact-centers')}>
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
              <div 
                className="sidebar-submenu-item sidebar-submenu-active sidebar-submenu-clickable"
                onClick={() => navigateToView('workflow-list')}
              >
                IVR workflows
              </div>
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
              <span 
                className="ivr-breadcrumb-link"
                onClick={() => navigateToView('workflow-list')}
              >
                Workflows
              </span>
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
                        ) : (
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
                  ) : (
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
              ) : (
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
              )}
            </div>
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
                        <span className="skill-selection-checkbox-label">Assign skill</span>
                      </div>
                      
                      <p className="skill-selection-description">Assign a skill to this call (choose a fixed skill or enter a variable).</p>
                      <div className="skill-dropdown-container">
                        <button 
                          className="skill-dropdown-button"
                          onClick={() => setSkillDropdownOpen(!skillDropdownOpen)}
                        >
                          {multipleSkills 
                            ? (selectedSkills.length > 0 ? `${selectedSkills.length} skills selected` : 'Assign skills')
                            : (selectedSkill || 'Assign skill')
                          }
                          <span className="skill-dropdown-arrow">▼</span>
                        </button>
                        {renderSkillDropdown()}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
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
                        <span className="skill-selection-checkbox-label">Assign skill</span>
                      </label>
                      
                      {skillSelectionEnabled && (
                        <>
                          <p className="skill-selection-description">Assign a skill to this call (choose a fixed skill or enter a variable).</p>
                          <div className="skill-dropdown-container">
                            <button 
                              className="skill-dropdown-button"
                              onClick={() => setSkillDropdownOpen(!skillDropdownOpen)}
                            >
                              {multipleSkills 
                                ? (selectedSkills.length > 0 ? `${selectedSkills.length} skills selected` : 'Assign skills')
                                : (selectedSkill || 'Assign skill')
                              }
                              <span className="skill-dropdown-arrow">▼</span>
                            </button>
                            {renderSkillDropdown()}
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

                  {selectedDestination === 'contact-center' && (
                    <div className="skill-selection-inline">
                      <label className="edit-label">
                        Contact Center <span className="edit-required">*</span>
                      </label>
                      <select 
                        className="edit-input"
                        value={selectedContactCenter}
                        onChange={(e) => setSelectedContactCenter(e.target.value)}
                      >
                        <option value="">Select contact center</option>
                        <option value="billing-center">Billing Center</option>
                        <option value="customer-service">Customer Service Center</option>
                        <option value="sales-center">Sales Center</option>
                        <option value="support-center">Support Center</option>
                        <option value="technical-center">Technical Center</option>
                      </select>

                      <div className="skill-selection-checkbox-container">
                        <input 
                          type="checkbox" 
                          className="skill-selection-checkbox"
                          checked={contactCenterSkillEnabled}
                          onChange={(e) => {
                            setContactCenterSkillEnabled(e.target.checked)
                            if (!e.target.checked) {
                              setSelectedSkill('')
                              setSelectedSkills([])
                              setSkillDropdownOpen(false)
                              setSkillLabelName('')
                              setSkillLabelValue('')
                              setShowSkillValueDropdown(false)
                            }
                          }}
                        />
                        <span className="skill-selection-checkbox-label">Assign skill</span>
                      </div>
                      
                      {contactCenterSkillEnabled && (
                        <>
                          <div className="skill-label-value-container">
                            <div className="skill-label-section">
                              <label className="edit-label">
                                Label name <span className="edit-required">*</span>
                                {skillLabelName && <span className="field-checkmark">✓</span>}
                              </label>
                              <input 
                                type="text"
                                className="edit-input"
                                placeholder="Enter name"
                                value={skillLabelName}
                                onChange={(e) => setSkillLabelName(e.target.value)}
                              />
                            </div>
                            
                            <div className="skill-value-section">
                              <label className="edit-label">
                                Label value <span className="edit-required">*</span>
                                {skillLabelValue && <span className="field-checkmark">✓</span>}
                              </label>
                              <p className="edit-description">Enter an expression, variable, or combination of both.</p>
                              <div className="skill-value-input-container">
                                <textarea
                                  className="skill-value-textarea"
                                  placeholder="Enter or search variable"
                                  value={skillLabelValue}
                                  onChange={(e) => setSkillLabelValue(e.target.value)}
                                  onFocus={() => setShowSkillValueDropdown(true)}
                                  onClick={() => setShowSkillValueDropdown(true)}
                                  rows={4}
                                />
                                {renderSkillValueDropdown()}
                              </div>
                            </div>
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
                    <input 
                      type="radio" 
                      name="fallback" 
                      className="edit-radio"
                      checked={selectedFallback === 'contact-center'}
                      onChange={() => setSelectedFallback('contact-center')}
                    />
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
                    let destinationLabel = '';
                    if (selectedDestination === 'operators') {
                      destinationLabel = 'Operators';
                    } else if (selectedDestination === 'voicemail') {
                      destinationLabel = 'Voicemail';
                    } else if (selectedDestination === 'contact-center' && selectedContactCenter) {
                      // Use the contact center name as destination
                      const contactCenterNames: Record<string, string> = {
                        'billing-center': 'Billing Center',
                        'customer-service': 'Customer Service Center',
                        'sales-center': 'Sales Center',
                        'support-center': 'Support Center',
                        'technical-center': 'Technical Center'
                      };
                      destinationLabel = contactCenterNames[selectedContactCenter] || 'Contact Center';
                    }
                    
                    if (destinationLabel) {
                      setNodeDestinations(prev => ({
                        ...prev,
                        [editingNodeId]: destinationLabel
                      }))
                    }
                    
                    // Save label name/value pair for contact center with skills
                    if (selectedDestination === 'contact-center' && contactCenterSkillEnabled && skillLabelName && skillLabelValue) {
                      setNodeLabelPairs(prev => ({
                        ...prev,
                        [editingNodeId]: { name: skillLabelName, value: skillLabelValue }
                      }))
                    } else {
                      // Clear label pair if not contact center or no label data
                      setNodeLabelPairs(prev => {
                        const newPairs = { ...prev }
                        delete newPairs[editingNodeId]
                        return newPairs
                      })
                    }
                    
                    // Save skill(s) if operators is selected and skill selection is enabled, or contact center with skills
                    if ((selectedDestination === 'operators' && skillSelectionEnabled) || 
                        (selectedDestination === 'contact-center' && contactCenterSkillEnabled)) {
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
                  setSkillLabelName('')
                  setSkillLabelValue('')
                  setShowSkillValueDropdown(false)
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
                    <span className="skill-selection-checkbox-label">Assign skill</span>
                  </div>
                  
                  <p className="skill-selection-description">Assign a skill to this call (choose a fixed skill or enter a variable).</p>
                  <div className="skill-dropdown-container">
                    <button 
                      className="skill-dropdown-button"
                      onClick={() => setSkillDropdownOpen(!skillDropdownOpen)}
                    >
                      {multipleSkills 
                        ? (selectedSkills.length > 0 ? `${selectedSkills.length} skills selected` : 'Assign skills')
                        : (selectedSkill || 'Assign skill')
                      }
                      <span className="skill-dropdown-arrow">▼</span>
                    </button>
                    {renderSkillDropdown()}
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
        className="ivr-prototype-settings-button"
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