export type Language = 'en' | 'zh-CN';

export interface Translations {
  // Common
  common: {
    loading: string;
    error: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    actions: string;
    status: string;
    online: string;
    offline: string;
  };
  
  // Navigation
  nav: {
    leaderboard: string;
    overview: string;
    customerListing: string;
    targetSummary: string;
    reports: string;
    settings: string;
    targetSettings: string;
    userManagement: string;
    appearance: string;
  };

  // Header
  header: {
    notifications: string;
    changeLanguage: string;
    switchToLightMode: string;
    switchToDarkMode: string;
    collapseSidebar: string;
    expandSidebar: string;
  };

  // Leaderboard
  leaderboard: {
    title: string;
    rankingIncentiveModule: string;
    topPerformersByCategory: string;
    highestDeposit: string;
    highestRetention: string;
    mostActivatedCustomers: string;
    mostReferrals: string;
    highestRepeatCustomers: string;
  };

  // Reports
  reports: {
    title: string;
    currentLeader: string;
    isLeading: string;
    leadAmount: string;
    netProfit: string;
    totalDeposit: string;
    totalActive: string;
    squadA: string;
    squadB: string;
  };

  // Target Settings
  targetSettings: {
    title: string;
    squadTargetGGR: string;
    option1: string;
    option2: string;
    option3: string;
    squadBalance: string;
    dailyRequired: string;
    singleBrandDailyRequired: string;
  };

  // Leaderboard
  leaderboardTable: {
    rank: string;
    memberBrand: string;
    score: string;
    deposit: string;
    retention: string;
    activation: string;
    referral: string;
    totalScore: string;
    netProfit: string;
    breakdown: string;
    viewDetails: string;
    daily: string;
    weekly: string;
    monthly: string;
    custom: string;
    squadVsSquad: string;
    squadToBrand: string;
    brandToPersonal: string;
  };

  // Customer Listing
  customerListing: {
    reactivation: string;
    retention: string;
    recommend: string;
    customerList: string;
    uniqueCode: string;
    username: string;
    brand: string;
    handler: string;
    label: string;
    addCustomer: string;
    importCustomers: string;
    exportCustomers: string;
    view: string;
    edit: string;
    delete: string;
    dragDropFile: string;
    or: string;
    browseFiles: string;
    supportedFormats: string;
    maxFileSize: string;
    startUploading: string;
    cancel: string;
  };

  // Targets
  targets: {
    title: string;
    totalGGR: string;
    cycle1: string;
    cycle2: string;
    cycle3: string;
    cycle4: string;
    target: string;
    current: string;
    remaining: string;
    achievement: string;
  };

  // User Management
  userManagement: {
    title: string;
    addUser: string;
    username: string;
    email: string;
    role: string;
    status: string;
    actions: string;
    active: string;
    inactive: string;
  };

  // Appearance Settings
  appearance: {
    theme: string;
    colorMode: string;
    chooseColorScheme: string;
    light: string;
    brightAndClean: string;
    dark: string;
    easyOnEyes: string;
    system: string;
    followSystemSetting: string;
    currentActiveTheme: string;
    typography: string;
    fontSize: string;
    adjustTextSize: string;
    small: string;
    compactView: string;
    medium: string;
    defaultSize: string;
    large: string;
    easierToRead: string;
    layoutBehavior: string;
    layoutDensity: string;
    controlSpacing: string;
    compact: string;
    moreContentVisible: string;
    normal: string;
    balancedSpacing: string;
    comfortable: string;
    moreBreathingRoom: string;
    sidebar: string;
    controlSidebarBehavior: string;
    autoCollapseOnSmallScreens: string;
    autoCollapseDescription: string;
    accessibility: string;
    motion: string;
    reduceAnimations: string;
    reduceMotion: string;
      minimizeAnimations: string;
  };

  // Overview/Dashboard
  overview: {
    personalContributionOverview: string;
    activeMember: string;
    depositAmount: string;
    retention: string;
    reactivation: string;
    recommend: string;
    contributionMetrics: string;
    gapToNextLevel: string;
    points: string;
    vsLastPeriod: string;
    squadContribution: string;
    totalSquadScore: string;
    leading: string;
    behind: string;
    squadRanking: string;
    depositAmountPerUser: string;
    averageDepositPerUser: string;
    trendChange: string;
    previousPeriod: string;
    lastPeriodAverage: string;
    goodMorning: string;
    goodAfternoon: string;
    goodEvening: string;
    selectDateRange: string;
    startDate: string;
    endDate: string;
    apply: string;
    user: string;
    contributionBreakdown: string;
    deposit: string;
    activation: string;
    referral: string;
    gapBetweenSquads: string;
    lagging: string;
    yourShareToSquad: string;
    yourShare: string;
    others: string;
    totalShare: string;
    yourContribution: string;
    squadMembers: string;
    targetProgress: string;
    targetValue: string;
    completionRate: string;
    remainingGap: string;
    executionPace: string;
    onTrack: string;
    atRisk: string;
    behindSchedule: string;
    behaviorResultMetrics: string;
    referredCustomers: string;
    reactivatedDormant: string;
    retentionCustomers: string;
    depositPerUser: string;
    targetGapAMGP: string;
    dataSourceTrafficSource: string;
    squadDetailsTopContributor: string;
    avgScore: string;
    members: string;
    topContributor: string;
    contribution: string;
    avg: string;
    view: string;
    configureSystem: string;
    fullControl: string;
    databaseStatus: string;
    lastUpdated: string;
    medicineSpecialist: string;
    loadingDashboard: string;
    failedToLoadData: string;
    retry: string;
    categoryTops: string;
    you: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      actions: 'Actions',
      status: 'Status',
      online: 'Online',
      offline: 'Offline',
    },
    nav: {
      leaderboard: 'Leaderboard',
      overview: 'Overview',
      customerListing: 'Customer Listing',
      targetSummary: 'Target Summary',
      reports: 'Reports',
      settings: 'Settings',
      targetSettings: 'Target Settings',
      userManagement: 'User Management',
      appearance: 'Appearance',
    },
    header: {
      notifications: 'Notifications',
      changeLanguage: 'Change language',
      switchToLightMode: 'Switch to light mode',
      switchToDarkMode: 'Switch to dark mode',
      collapseSidebar: 'Collapse sidebar',
      expandSidebar: 'Expand sidebar',
    },
    leaderboard: {
      title: 'Leaderboard',
      rankingIncentiveModule: 'Ranking & Incentive Module',
      topPerformersByCategory: 'Top Performers by Category',
      highestDeposit: 'Highest Deposit',
      highestRetention: 'Highest Retention',
      mostActivatedCustomers: 'Most Activated Customers',
      mostReferrals: 'Most Referrals',
      highestRepeatCustomers: 'Highest Repeat Customers',
    },
    reports: {
      title: 'Monthly Target & Report',
      currentLeader: 'Current Leader',
      isLeading: 'is Leading',
      leadAmount: 'Lead Amount',
      netProfit: 'Net Profit',
      totalDeposit: 'Total Deposit',
      totalActive: 'Total Active',
      squadA: 'Squad A',
      squadB: 'Squad B',
    },
    targetSettings: {
      title: 'Target Settings',
      squadTargetGGR: 'Squad Target GGR',
      option1: 'Option 1',
      option2: 'Option 2',
      option3: 'Option 3',
      squadBalance: 'Squad Balance',
      dailyRequired: 'Daily Required',
      singleBrandDailyRequired: 'Single Brand Daily Required',
    },
    leaderboardTable: {
      rank: 'Rank',
      memberBrand: 'Member/Brand',
      score: 'Score',
      deposit: 'Deposit',
      retention: 'Retention',
      activation: 'Activation',
      referral: 'Referral',
      totalScore: 'Total Score',
      netProfit: 'Net Profit',
      breakdown: 'Breakdown',
      viewDetails: 'View Details',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      custom: 'Custom',
      squadVsSquad: 'Squad vs Squad',
      squadToBrand: 'Squad → Brand',
      brandToPersonal: 'Brand → Personal',
    },
        customerListing: {
          reactivation: 'Reactivation',
          retention: 'Retention',
          recommend: 'Recommend',
          customerList: 'Customer List',
          uniqueCode: 'Unique Code',
      username: 'Username',
      brand: 'Brand',
      handler: 'Handler',
      label: 'Label',
      addCustomer: 'Add Customer',
      importCustomers: 'Import Customers',
      exportCustomers: 'Export Customers',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      dragDropFile: 'Drag and drop your file here, or click to browse',
      or: 'or',
      browseFiles: 'Browse Files',
      supportedFormats: 'Supported formats: Excel (.xlsx, .xls) or CSV (.csv)',
      maxFileSize: 'Maximum file size: 10MB',
      startUploading: 'Start Uploading',
      cancel: 'Cancel',
    },
    targets: {
      title: 'Target Summary',
      totalGGR: 'Total GGR',
      cycle1: 'Cycle 1',
      cycle2: 'Cycle 2',
      cycle3: 'Cycle 3',
      cycle4: 'Cycle 4',
      target: 'Target',
      current: 'Current',
      remaining: 'Remaining',
      achievement: 'Achievement',
    },
    userManagement: {
      title: 'User Management',
      addUser: 'Add User',
      username: 'Username',
      email: 'Email',
      role: 'Role',
      status: 'Status',
      actions: 'Actions',
      active: 'Active',
      inactive: 'Inactive',
    },
    appearance: {
      theme: 'Theme',
      colorMode: 'Color Mode',
      chooseColorScheme: 'Choose your preferred color scheme',
      light: 'Light',
      brightAndClean: 'Bright and clean',
      dark: 'Dark',
      easyOnEyes: 'Easy on the eyes',
      system: 'System',
      followSystemSetting: 'Follow system setting',
      currentActiveTheme: 'Current active theme',
      typography: 'Typography',
      fontSize: 'Font Size',
      adjustTextSize: 'Adjust the text size for better readability',
      small: 'Small',
      compactView: 'Compact view',
      medium: 'Medium',
      defaultSize: 'Default size',
      large: 'Large',
      easierToRead: 'Easier to read',
      layoutBehavior: 'Layout & Behavior',
      layoutDensity: 'Layout Density',
      controlSpacing: 'Control spacing between elements',
      compact: 'Compact',
      moreContentVisible: 'More content visible',
      normal: 'Normal',
      balancedSpacing: 'Balanced spacing',
      comfortable: 'Comfortable',
      moreBreathingRoom: 'More breathing room',
      sidebar: 'Sidebar',
      controlSidebarBehavior: 'Control sidebar behavior',
      autoCollapseOnSmallScreens: 'Auto-collapse on small screens',
      autoCollapseDescription: 'Automatically collapse sidebar on mobile devices',
      accessibility: 'Accessibility',
      motion: 'Motion',
      reduceAnimations: 'Reduce animations for better performance and accessibility',
      reduceMotion: 'Reduce motion',
      minimizeAnimations: 'Minimize animations and transitions',
    },
    overview: {
      personalContributionOverview: 'Personal Contribution Overview',
      activeMember: 'Active Member',
      depositAmount: 'Deposit Amount',
      retention: 'Retention',
      reactivation: 'Reactivation',
      recommend: 'Recommend',
      contributionMetrics: 'Contribution Metrics',
      gapToNextLevel: 'Gap to Next Level',
      points: 'points',
      vsLastPeriod: 'vs Last Period',
      squadContribution: 'Squad Contribution',
      totalSquadScore: 'Total Squad Score',
      leading: 'Leading',
      behind: 'Behind',
      squadRanking: 'Squad Ranking',
      depositAmountPerUser: 'Deposit Amount per User',
      averageDepositPerUser: 'Average deposit per user',
      trendChange: 'Trend Change',
      previousPeriod: 'Previous Period',
      lastPeriodAverage: 'Last period average',
      goodMorning: 'Good Morning',
      goodAfternoon: 'Good Afternoon',
      goodEvening: 'Good Evening',
      selectDateRange: 'Select Date Range',
      startDate: 'Start Date',
      endDate: 'End Date',
      apply: 'Apply',
      user: 'User',
      contributionBreakdown: 'Contribution Breakdown',
      deposit: 'Deposit',
      activation: 'Activation',
      referral: 'Referral',
      gapBetweenSquads: 'Gap Between Squads',
      lagging: 'Lagging',
      yourShareToSquad: 'Your Share to Squad',
      yourShare: 'Your Share',
      others: 'Others',
      totalShare: 'Total Share',
      yourContribution: 'Your Contribution',
      squadMembers: 'Squad Members',
      targetProgress: 'Target & Progress',
      targetValue: 'Target Value',
      completionRate: 'Completion Rate',
      remainingGap: 'Remaining Gap',
      executionPace: 'Execution Pace',
      onTrack: 'On Track',
      atRisk: 'At Risk',
      behindSchedule: 'Behind Schedule',
      behaviorResultMetrics: 'Behavior & Result Metrics',
      referredCustomers: 'Referred Customers',
      reactivatedDormant: 'Reactivated Dormant',
      retentionCustomers: 'Retention Customers',
      depositPerUser: 'Deposit per User',
      targetGapAMGP: 'Target Gap (AM/GP)',
      dataSourceTrafficSource: 'Data Source - Traffic Source',
      squadDetailsTopContributor: 'Squad Details & Top Contributor',
      avgScore: 'Avg Score',
      members: 'Members',
      topContributor: 'Top Contributor',
      contribution: 'Contribution',
      avg: 'Avg',
      view: 'View',
      configureSystem: 'Configure System',
      fullControl: 'Full Control',
      databaseStatus: 'Database Status',
      lastUpdated: 'Last Updated',
      medicineSpecialist: 'Medicine Specialist',
      loadingDashboard: 'Loading dashboard...',
      failedToLoadData: 'Failed to load data',
      retry: 'Retry',
      categoryTops: 'Category Tops',
      you: 'You',
    },
  },
  'zh-CN': {
    common: {
      loading: '加载中...',
      error: '错误',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      add: '添加',
      search: '搜索',
      filter: '筛选',
      actions: '操作',
      status: '状态',
      online: '在线',
      offline: '离线',
    },
    nav: {
      leaderboard: '排行榜',
      overview: '概览',
      customerListing: '客户列表',
      targetSummary: '目标摘要',
      reports: '报告',
      settings: '设置',
      targetSettings: '目标设置',
      userManagement: '用户管理',
      appearance: '外观',
    },
    header: {
      notifications: '通知',
      changeLanguage: '更改语言',
      switchToLightMode: '切换到浅色模式',
      switchToDarkMode: '切换到深色模式',
      collapseSidebar: '折叠侧边栏',
      expandSidebar: '展开侧边栏',
    },
    leaderboard: {
      title: '排行榜',
      rankingIncentiveModule: '排名与激励模块',
      topPerformersByCategory: '分类顶级表现者',
      highestDeposit: '最高存款',
      highestRetention: '最高留存率',
      mostActivatedCustomers: '最多激活客户',
      mostReferrals: '最多推荐',
      highestRepeatCustomers: '最多重复客户',
    },
    reports: {
      title: '月度目标与报告',
      currentLeader: '当前领先',
      isLeading: '领先',
      leadAmount: '领先金额',
      netProfit: '净利润',
      totalDeposit: '总存款',
      totalActive: '总活跃',
      squadA: '小队A',
      squadB: '小队B',
    },
    targetSettings: {
      title: '目标设置',
      squadTargetGGR: '小队目标GGR',
      option1: '选项1',
      option2: '选项2',
      option3: '选项3',
      squadBalance: '小队余额',
      dailyRequired: '每日需求',
      singleBrandDailyRequired: '单个品牌每日需求',
    },
    leaderboardTable: {
      rank: '排名',
      memberBrand: '成员/品牌',
      score: '分数',
      deposit: '存款',
      retention: '留存',
      activation: '激活',
      referral: '推荐',
      totalScore: '总分',
      netProfit: '净利润',
      breakdown: '明细',
      viewDetails: '查看详情',
      daily: '每日',
      weekly: '每周',
      monthly: '每月',
      custom: '自定义',
      squadVsSquad: '小队 vs 小队',
      squadToBrand: '小队 → 品牌',
      brandToPersonal: '品牌 → 个人',
    },
    customerListing: {
      reactivation: '重新激活',
      retention: '留存',
      recommend: '推荐',
      customerList: '客户列表',
      uniqueCode: '唯一代码',
      username: '用户名',
      brand: '品牌',
      handler: '处理人',
      label: '标签',
      addCustomer: '添加客户',
      importCustomers: '导入客户',
      exportCustomers: '导出客户',
      view: '查看',
      edit: '编辑',
      delete: '删除',
      dragDropFile: '拖放文件到此处，或点击浏览',
      or: '或',
      browseFiles: '浏览文件',
      supportedFormats: '支持格式：Excel (.xlsx, .xls) 或 CSV (.csv)',
      maxFileSize: '最大文件大小：10MB',
      startUploading: '开始上传',
      cancel: '取消',
    },
    targets: {
      title: '目标摘要',
      totalGGR: '总GGR',
      cycle1: '周期1',
      cycle2: '周期2',
      cycle3: '周期3',
      cycle4: '周期4',
      target: '目标',
      current: '当前',
      remaining: '剩余',
      achievement: '完成度',
    },
    userManagement: {
      title: '用户管理',
      addUser: '添加用户',
      username: '用户名',
      email: '邮箱',
      role: '角色',
      status: '状态',
      actions: '操作',
      active: '活跃',
      inactive: '非活跃',
    },
    appearance: {
      theme: '主题',
      colorMode: '颜色模式',
      chooseColorScheme: '选择您喜欢的配色方案',
      light: '浅色',
      brightAndClean: '明亮清爽',
      dark: '深色',
      easyOnEyes: '护眼',
      system: '系统',
      followSystemSetting: '跟随系统设置',
      currentActiveTheme: '当前活动主题',
      typography: '字体',
      fontSize: '字体大小',
      adjustTextSize: '调整文本大小以提高可读性',
      small: '小',
      compactView: '紧凑视图',
      medium: '中',
      defaultSize: '默认大小',
      large: '大',
      easierToRead: '更易阅读',
      layoutBehavior: '布局与行为',
      layoutDensity: '布局密度',
      controlSpacing: '控制元素之间的间距',
      compact: '紧凑',
      moreContentVisible: '显示更多内容',
      normal: '正常',
      balancedSpacing: '平衡间距',
      comfortable: '舒适',
      moreBreathingRoom: '更多呼吸空间',
      sidebar: '侧边栏',
      controlSidebarBehavior: '控制侧边栏行为',
      autoCollapseOnSmallScreens: '小屏幕自动折叠',
      autoCollapseDescription: '在移动设备上自动折叠侧边栏',
      accessibility: '无障碍',
      motion: '动画',
      reduceAnimations: '减少动画以提高性能和可访问性',
      reduceMotion: '减少动画',
      minimizeAnimations: '最小化动画和过渡',
    },
    overview: {
      personalContributionOverview: '个人贡献概览',
      activeMember: '活跃成员',
      depositAmount: '存款金额',
      retention: '留存',
      reactivation: '重新激活',
      recommend: '推荐',
      contributionMetrics: '贡献指标',
      gapToNextLevel: '距离下一级',
      points: '分',
      vsLastPeriod: '与上期相比',
      squadContribution: '小队贡献',
      totalSquadScore: '小队总分',
      leading: '领先',
      behind: '落后',
      squadRanking: '小队排名',
      depositAmountPerUser: '每用户存款金额',
      averageDepositPerUser: '每用户平均存款',
      trendChange: '趋势变化',
      previousPeriod: '上一期',
      lastPeriodAverage: '上期平均值',
      goodMorning: '早上好',
      goodAfternoon: '下午好',
      goodEvening: '晚上好',
      selectDateRange: '选择日期范围',
      startDate: '开始日期',
      endDate: '结束日期',
      apply: '应用',
      user: '用户',
      contributionBreakdown: '贡献明细',
      deposit: '存款',
      activation: '激活',
      referral: '推荐',
      gapBetweenSquads: '小队间差距',
      lagging: '落后',
      yourShareToSquad: '您对小队份额',
      yourShare: '您的份额',
      others: '其他',
      totalShare: '总份额',
      yourContribution: '您的贡献',
      squadMembers: '小队成员',
      targetProgress: '目标与进度',
      targetValue: '目标值',
      completionRate: '完成率',
      remainingGap: '剩余差距',
      executionPace: '执行速度',
      onTrack: '正常',
      atRisk: '有风险',
      behindSchedule: '落后计划',
      behaviorResultMetrics: '行为与结果指标',
      referredCustomers: '推荐客户',
      reactivatedDormant: '重新激活休眠',
      retentionCustomers: '留存客户',
      depositPerUser: '每用户存款',
      targetGapAMGP: '目标差距(活跃成员/总利润)',
      dataSourceTrafficSource: '数据源 - 流量来源',
      squadDetailsTopContributor: '小队详情与顶级贡献者',
      avgScore: '平均分数',
      members: '成员',
      topContributor: '顶级贡献者',
      contribution: '贡献',
      avg: '平均',
      view: '查看',
      configureSystem: '配置系统',
      fullControl: '完全控制',
      databaseStatus: '数据库状态',
      lastUpdated: '最后更新',
      medicineSpecialist: '医学专家',
      loadingDashboard: '加载仪表板...',
      failedToLoadData: '加载数据失败',
      retry: '重试',
      categoryTops: '分类顶级',
      you: '您',
    },
  },
};

export function getTranslation(language: Language, key: keyof Translations): Translations[keyof Translations] {
  return translations[language][key];
}

// Helper functions for type-safe access
export function t(language: Language) {
  return {
    common: translations[language].common,
    nav: translations[language].nav,
    header: translations[language].header,
    leaderboard: translations[language].leaderboard,
    reports: translations[language].reports,
    targetSettings: translations[language].targetSettings,
    leaderboardTable: translations[language].leaderboardTable,
    customerListing: translations[language].customerListing,
    targets: translations[language].targets,
    userManagement: translations[language].userManagement,
    appearance: translations[language].appearance,
    overview: translations[language].overview,
  };
}

