Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',



    _initDate: undefined,
    _endDate: undefined,

    _releaseId: undefined,
    _releaseName: undefined,
    _milestoneId: undefined,
    _iterationId: undefined,
    _iterationName: undefined,

    _initItems: undefined,
    _endItems: undefined,

    _searchParameter: undefined,
    _addedChangedParameter: undefined,

    items:[
        {
            xtype:'container',
            itemId:'header',
            cls:'header'
        },
        {
            xtype:'container',
            itemId:'bodyContainer',
      //       layout: {
		    //     type: 'vbox'
		    // },
             height:'90%',
             width:'100%',
             autoScroll:true
        }
    ],

    launch: function() {
        //Write app code here

        //API Docs: https://help.rallydev.com/apps/2.1/doc/

        var context =  this.getContext();
        var project = context.getProject()['ObjectID'];
        var projectId = project;   

        var milestoneCombo = Ext.widget('rallymilestonecombobox', {
        	fieldLabel: 'Choose Milestone',
			itemId: 'milestonecombobox',
			allowClear: true,
			width: 300,
			listeners: {
				change: function(combo) {
					//console.log('change: ', combo);
					//console.log('change: ', combo.getValue());
					//console.log('store', this._milestoneComboStore);

					if (combo.getValue() && combo.getValue() != '' && combo.valueModels.length > 0) {						
						var milestones = combo.valueModels;

						console.log('milestone selected', milestones[0].get('ObjectID'));
						this._milestoneId = milestones[0].get('ObjectID');	
					}
				},
				ready: function(combo) {
					//console.log('ready: ', combo.value);
					//console.log('store', this._milestoneComboStore);
					//this._setFilter(combo.value);
				},
				scope: this
			}
		});

		var releaseComboBox = Ext.create('Rally.ui.combobox.ReleaseComboBox', {
			fieldLabel: 'Choose Release',
			width: 400,
			itemId: 'releasaeComboBox',
			allowClear: true,
			showArrows: false,
			scope: this,
			listeners: {
				ready: function(combobox) {
					var release = combobox.getRecord();

					//this._initDate = Rally.util.DateTime.toIsoString(release.get('ReleaseStartDate'),true);
					//this._endDate = Rally.util.DateTime.toIsoString(release.get('ReleaseDate'),true);
					this._releaseId = release.get('ObjectID');
					this._releaseName = combobox.getRecord().get('Name');  
				},
				select: function(combobox, records) {
					var release = records[0];

					//this._initDate = Rally.util.DateTime.toIsoString(release.get('ReleaseStartDate'),true);
					//this._endDate = Rally.util.DateTime.toIsoString(release.get('ReleaseDate'),true);
					this._releaseId = release.get('ObjectID');
					this._releaseName = combobox.getRecord().get('Name');  
				},
				scope: this
			}
		});

		var iterationComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', {
			fieldLabel: 'Choose Iteration',
			width: 400,
            itemId: 'iterationComboBox',
            allowClear: true,
            showArrows: false,
            scope: this,
            listeners: {
                ready: function(combobox) {
                	var iteration = combobox.getRecord();
                	this._iterationId = iteration.get('ObjectID');
                	this._iterationName = iteration.get('Name');

                },
                select: function(combobox, records, opts) {
                    var iteration = records[0];
                	this._iterationId = iteration.get('ObjectID');
                	this._iterationName = iteration.get('Name');
                },
                scope: this
            }

        });

        var searchButton = Ext.create('Rally.ui.Button', {
        	text: 'Search',
        	margin: '10 10 10 100',
        	scope: this,
        	handler: function() {
        		//handles search
        		//console.log(initDate, endDate);
        		this._doSearch(projectId, this._initDate, this._endDate);
        		//this._loadEndData(projectId, this._releaseId, null);
        	}
        });


        this.myMask = new Ext.LoadMask({
            msg: 'Please wait...',
            target: this
        });



        this.down('#header').add([
		{
			xtype: 'panel',
			autoWidth: true,
			height: 180,
			layout: 'hbox',

			items: [{
				xtype: 'panel',
				title: 'Choose date range:',
				//width: 450,
				//layout: 'fit',
				flex: 3,
				align: 'stretch',
				autoHeight: true,
				bodyPadding: 10,
				items: [{
					xtype: 'datefield',
					anchor: '100%',
			        fieldLabel: 'From',
					scope: this,
		        	listeners : {
		        		change: function(picker, newDate, oldDate) {
		        			this._initDate = newDate.toISOString();
		        		},
		        		scope:this
		        	}
				}, {
					xtype: 'datefield',
					anchor: '100%',
			        fieldLabel: 'To',
					scope: this,
		        	listeners : {
		        		change: function(picker, newDate, oldDate) {
		        			this._endDate = newDate;
		        		},
		        		scope:this
		        	}
				}, {
		            xtype      : 'radiogroup',
		            fieldLabel : 'Choose parameter',
		            items: [
		                {
		                	xtype	  : 'radiofield',				            
		                    id        : 'radio1',
		                    name      : 'parameter',
		                    boxLabel  : 'Release',
		                    padding: '0 10 0 0',				            
		                    inputValue: 'r'
		                }, {
		                    boxLabel  : 'Iteration',
		                    name      : 'parameter',
		                    padding: '0 10 0 0',			            
		                    inputValue: 'i',
		                    id        : 'radio2'
		                }, {
		                    boxLabel  : 'Milestone',
		                    name      : 'parameter',
		                    padding: '0 10 0 0',			            
		                    inputValue: 'm',
		                    id        : 'radio3'
		                }
		            ],
		            listeners: {
				        change: function(field, newValue, oldValue) {
				            var value = newValue.parameter;
				            this._searchParameter = value;

				            console.log('value radio:', value);
				            var fieldContainer = Ext.getCmp('milestoneFieldContainer');

				            if (value == 'r') {
				            	releaseComboBox.show();
				            	iterationComboBox.hide();
				            	milestoneCombo.hide();
				            	
				            	fieldContainer.hide();
				            } else if (value == 'i') {
				            	releaseComboBox.hide();
				            	iterationComboBox.show();
				            	milestoneCombo.hide();
				            	fieldContainer.hide();
				            } else {
				            	releaseComboBox.hide();
				            	iterationComboBox.hide();
				            	milestoneCombo.show();
				            	fieldContainer.show();
				            }				            
				        },
				        scope: this
				    }
		        }, {
		        	xtype      : 'radiogroup',
		            fieldLabel : 'Choose Changed/Added',
		            columns: 2,	            
		            items: [
		                {
		                	xtype	  : 'radiofield',				            
		                    id        : 'addedRadio',
		                    name      : 'addedChanged',
		                    padding: '0 10 0 0',
		                    boxLabel  : 'Added',				            
		                    inputValue: 'a'
		                }, {
		                    boxLabel  : 'Changed',
		                    name      : 'addedChanged',
		                    padding: '0 10 0 0',
		                    inputValue: 'c',
		                    id        : 'changedRario'
		                }
		            ],
		            listeners: {
				        change: function(field, newValue, oldValue) {
				            var value = newValue.addedChanged;
				            this._addedChangedParameter = value;

				            console.log('value radio:', value);
				        },
				        scope: this
				    }
		        }]
			}]
		},
		{
			xtype: 'panel',
			items: [
				{
					xtype: 'fieldcontainer',
					id: 'milestoneFieldContainer',
					fieldLabel: 'Choose Milestone',
					pack: 'end',
					labelAlign: 'right',
					items: [
						milestoneCombo
					]
				},
				releaseComboBox,
				iterationComboBox,
				searchButton
			]
		}]);

		releaseComboBox.hide();
    	iterationComboBox.hide();
    	milestoneCombo.hide();

    	var fieldContainer = Ext.getCmp('milestoneFieldContainer');
    	fieldContainer.hide();
    },



    _doSearch: function (projectId, initDate, endDate) {
    	if (initDate == '' || endDate == '') {
    		return;
    	}

    	this.myMask.show();
        console.log('loading init features', initDate, endDate);

        console.log('search parameter:', this._searchParameter);

        var property;
        var operator = '=';
        var releaseIteration;
        if ('m' == this._searchParameter) {
        	property = 'Milestones';
        	releaseIteration = this._milestoneId;
        	this._loadInitData(projectId, initDate, endDate, property, operator, releaseIteration);
        } else if ('i' == this._searchParameter) {
        	property = 'Iteration';
        	operator = 'in';

        	var promiseIterations = this._loadIterations(projectId);

	        Deft.Promise.all([promiseIterations]).then({
	        	success: function(records) {
	                console.log('promises:', records);
	                var iterations = records[0];

	                this._loadInitData(projectId, initDate, endDate, property, operator, iterations);
	            },
	            failure: function(error) {
	                console.log('error:', error);
	            },
	            scope: this
	        });
        } else if ('r' == this._searchParameter) {
        	property = 'Release';
        	operator = 'in';
        	var promiseReleases = this._loadReleases(projectId);

	        Deft.Promise.all([promiseReleases]).then({
	        	success: function(records) {
	                console.log('promises:', records);
	                var releases = records[0];

	                this._loadInitData(projectId, initDate, endDate, property, operator, releases);
	            },
	            failure: function(error) {
	                console.log('error:', error);
	            },
	            scope: this
	        });

        }

        
    },


    _loadInitData: function(projectId, initDate, endDate, property, operator, releaseIteration) {
    	this.filtersInit = [
    		{
                property : '__At',
                value    : initDate
            },
            
            {
                property : '_TypeHierarchy',
                operator : 'in',
                value    : [ "Defect", "HierarchicalRequirement", "PortfolioItem/Feature"]
            },
           	{
                property : '_ProjectHierarchy',
                value: projectId
            },
            {
            	property : property,
            	operator : operator,
            	value : releaseIteration
            }
    	];


        console.log('filters:', this.filtersInit);

        var store = Ext.create('Rally.data.lookback.SnapshotStore', {
            fetch : ['Name', 
                'FormattedID', 
                'CreatedBy',
                'CreationDate',
                'LeafStoryPlanEstimateTotal', 
                'LeafStoryCount', 
                'PreliminaryEstimate', 
                'PlanEstimate', 
                'PortfolioItem',
                'ScheduleState',
                'Children',
                'Milestones',
                'State', 
                'Parent', 
                'Project',
                'PercentDoneByStoryPlanEstimate',
                '_User', 
                "_ValidFrom", 
                "_ValidTo"],
            // filters : this.filtersInit,
            filters : this.filtersInit,
            autoLoad: true,
            sorters: [{
                property: 'ObjectID',
                direction: 'ASC'
            }],
            limit: Infinity,
            hydrate: ["State", "ScheduleState", 'Project'],

            listeners: {
                load: function(store, data, success) {
                	console.log('Init Store', store);
                	this._initItems = data;
                	this._loadEndData(projectId, initDate, endDate, releaseIteration);
                	//this._loadEndData();
                },
                scope: this
            }
        });
    },


    _loadEndData: function (projectId, initDate, endDate, releaseIteration) {
        console.log('loading end features', initDate, endDate);

        console.log('search parameter:', this._searchParameter);

        var property;
        var operator = '=';
        if ('r' == this._searchParameter) {
        	property = 'Release';
        	operator = 'in';
        } else if ('i' == this._searchParameter) {
        	property = 'Iteration';
        	operator = 'in';
        } else if ('m' == this._searchParameter) {
        	property = 'Milestones';
        	releaseIteration = this._milestoneId;
        }


        this.filtersEnd = [
    		{
                property : '__At',
                value    : this._endDate
            },
            
            {
                property : '_TypeHierarchy',
                operator : 'in',
                value    : [ "Defect", "HierarchicalRequirement", "PortfolioItem/Feature"]
            },
           	{
                property : '_ProjectHierarchy',
                value: projectId
            },
            {
            	property : property,
            	operator : operator,
            	value : releaseIteration
            }
    	];


        console.log('filters:', this.filtersEnd);

        var store = Ext.create('Rally.data.lookback.SnapshotStore', {
            fetch : ['Name', 
                'FormattedID', 
                'CreatedBy',
                'CreationDate',
                'LeafStoryPlanEstimateTotal', 
                'LeafStoryCount', 
                'PreliminaryEstimate', 
                'PlanEstimate', 
                'PortfolioItem',
                'ScheduleState',
                'TestCase',
                'Milestones',
                'State', 
                'Parent', 
                'Project',
                'PercentDoneByStoryPlanEstimate',
                '_User', 
                "_ValidFrom", 
                "_ValidTo"],
            filters : this.filtersEnd,
            autoLoad: true,
            sorters: [{
                property: 'ObjectID',
                direction: 'ASC'
            }],
            limit: Infinity,
            hydrate: ['State', 'ScheduleState', 'Project'],

            listeners: {
                load: function(store, data, success) {
                	console.log('End Store', store);
                	this._endItems = data;
                	//this._loadEndData();

                	this._findDataAdded(projectId, initDate, endDate);
                },
                scope: this
            }
        });
    },


    _getFeatureIds: function(data) {
    	var ids = [];

    	_.each(data, function(record) {
    		if (record.get('FormattedID').startsWith('F')) {
            	ids.push(record.get('ObjectID'));    			
    		}
        });

        console.log('featureIds', ids);

    	return ids;

    },


    _loadChildStories: function(projectId, initDate, featureIds) {
    	var deferred = Ext.create('Deft.Deferred');

    	if (this._searchParameter == 'i') {
    		return deferred.resolve();
    	}

    	var filtersInit = [
    		{
                property : '__At',
                value    : initDate
            },
            
            {
                property : '_TypeHierarchy',
                operator : 'in',
                value    : [ "HierarchicalRequirement"]
            },
           	{
                property : '_ProjectHierarchy',
                value: projectId
            },
            {
            	property : 'PortfolioItem',
            	operator : 'in',
            	value : featureIds
            }
    	];

    	var store = Ext.create('Rally.data.lookback.SnapshotStore', {
            fetch : ['Name', 
                'FormattedID', 
                'CreatedBy',
                'CreationDate',
                'PlanEstimate', 
                'PortfolioItem',
                'ScheduleState',
                'State', 
                'Parent', 
                'Project',
                '_User', 
                "_ValidFrom", 
                "_ValidTo"],
            // filters : this.filtersInit,
            filters : filtersInit,
            autoLoad: true,
            sorters: [{
                property: 'ObjectID',
                direction: 'ASC'
            }],
            limit: Infinity,
            hydrate: ["State", "ScheduleState", 'Project'],

            listeners: {
                load: function(store, data, success) {
                	deferred.resolve(data);
                	console.log('child Store', data);
                },
                scope: this
            }
        });

        return deferred.promise;
    },


    _findDataAdded: function(projectId, initDate, endDate) {
    	var initIds = [];
    	var endIds = [];
    	var initFeatures = [];
        var endFeatures = [];
        var endStories = [];
        var endDefects = [];

        var parentIds = [];
        var testCaseIds = [];
        var userIds = [];

    	_.each(this._initItems, function(record) {
            initIds.push(record.get('ObjectID'));
        });

        _.each(this._endItems, function(record) {
            endIds.push(record.get('ObjectID'));

            var parent;
            if (record.get('PortfolioItem') != "") {
                parent = record.get('PortfolioItem');
            } else if (record.get('Parent') != "") {
                parent = record.get('Parent');
            }

            var testCaseId;
            if (record.get('TestCase') != "") {
                testCaseId = record.get('TestCase');
            }

            var userId;
            if (record.get('_User') != "") {
            	userId = record.get('_User');
            }

            if (parent && !Ext.Array.contains(parentIds, parent)) {
                parentIds.push(parent);
            }

            if (testCaseId && !Ext.Array.contains(testCaseIds, testCaseId)) {
                testCaseIds.push(testCaseId);
            }

            if (userId && !Ext.Array.contains(userIds, userId)) {
                userIds.push(userId);
            }
        });



        var featureIds = [];
        _.each(this._endItems, function(record) {
        	if (!Ext.Array.contains(initIds, record.get('ObjectID'))) {
        		if (record.get('FormattedID').startsWith('F')) {
	            	featureIds.push(record.get('ObjectID'));    			
	    		}
        	}
        });



        var promise = this._loadParentNames(parentIds);
        var promiseTestCases = this._loadTestCaseNames(testCaseIds);
        var promisePreliminaryEstimate = this._loadPreliminaryEstimates();
        var promiseUsers = this._loadUsers(userIds);
		var childStoriesPromise = this._loadChildStories(projectId, initDate, featureIds);

        Deft.Promise.all([promise, promiseTestCases, promiseUsers, promisePreliminaryEstimate, childStoriesPromise]).then({
            success: function(records) {
            	var parentNames = records[0];
            	var testCaseNames = records[1];
            	var users = records[2];
            	var preliminaryEstimates = records[3];
            	var childStories = records[4];

            	console.log('child', childStories);

            	//concat endItems with childStories
            	var addedItems;
            	if (childStories) {
            		addedItems = this._endItems.concat(childStories);
            	} else {
            		addedItems = this._endItems;
            	}
            		

            	//find features not planned / items on endItems that were not included in initItems
		        _.each(addedItems, function(record) {
		            var id = record.get('ObjectID');
		            var state = record.get('State');

		            var planned = true;
                    //console.log('checking if', id, 'exists in', initIds);
		            if (!Ext.Array.contains(initIds, id)) {
		                planned = false;

		                var parent;
	                    if (record.get('FormattedID').startsWith('D')) {
	                        parent = testCaseNames.get(record.get('TestCase'));
	                    } else {
	                        parent = parentNames.get(record.get('PortfolioItem') == "" ? record.get('Parent') : record.get('PortfolioItem'));
	                    }

	                    var user = users.get(record.get('_User'));


			            var refUrl;
			            var type;
			            if (record.get('FormattedID').startsWith('D')) {
			                refUrl = '/defect/' + id;
			                type = 'Defect';

			                endDefects.push({
				                _ref: refUrl,
				                FormattedID: record.get('FormattedID'),
				               	Parent: parent,
				                Name: record.get('Name'),
				                PlanEstimate: record.get('PlanEstimate'),			                
				                CreationDate: record.get('CreationDate'),
				                Project: record.get('Project').Name,
				                Owner: user,
				                Planned: planned
				            });
			            } else if (record.get('FormattedID').startsWith('S')) {
			                refUrl = '/userstory/' + id;
			                type = 'Story';

			                endStories.push({
				                _ref: refUrl,
				                FormattedID: record.get('FormattedID'),
				               	Parent: parent,
				                Name: record.get('Name'),
				                PlanEstimate: record.get('PlanEstimate'),			                
				                CreationDate: record.get('CreationDate'),
				                Project: record.get('Project').Name,
				                Owner: user,
				                Planned: planned
				            });
			            } else {
			            	refUrl = '/portfolioitem/feature/' + id;
			            	type = 'Feature';

			            	endFeatures.push({
				                _ref: refUrl,
				                FormattedID: record.get('FormattedID'),
				               	Parent: parent,
				                Name: record.get('Name'),
				                PreliminaryEstimate: preliminaryEstimates.get(record.get('PreliminaryEstimate')),
				                LeafStoryPlanEstimateTotal: record.get('LeafStoryPlanEstimateTotal'),
				                CreationDate: record.get('CreationDate'),
				                Project: record.get('Project').Name,
				                Owner: user,
				                // State: record.get('State'),
				                // PercentDoneByStoryPlanEstimate: record.get('PercentDoneByStoryPlanEstimate'),
				                Planned: planned
				                // Completed: completed,                
				                // LeafStoryCount: record.get('LeafStoryCount'),                
				                // AcceptedLeafStoryCount: record.get('AcceptedLeafStoryCount'),
				                // AcceptedLeafStoryPlanEstimateTotal: record.get('AcceptedLeafStoryPlanEstimateTotal'),
				                // ActualEndDate: record.get('ActualEndDate')
				                
				            });
			            }
		            }		            
		        }, this);


		        //find feature that were not delivered / items on initItems that were not included in endItems.
		        _.each(this._initItems, function(record) {
		            var id = record.get('ObjectID');
		            var removed = false;

		            //console.log('checking if', id, 'exists in', endIds);
		            if (!Ext.Array.contains(endIds, id)) {
		                removed = true;
		            }

		            var refUrl;
		            if (record.get('FormattedID').startsWith('D')) {
		                refUrl = '/defect/' + id;
		            } else if (record.get('FormattedID').startsWith('S')) {
		                refUrl = '/userstory/' + id;
		            } else {
		            	refUrl = '/portfolioitem/feature/' + id;
		            }

		            initFeatures.push({
		                _ref: refUrl,
		                FormattedID: record.get('FormattedID'),
		                Name: record.get('Name'),
		                PreliminaryEstimate: record.get('PreliminaryEstimate'),
		                LeafStoryPlanEstimateTotal: record.get('LeafStoryPlanEstimateTotal'),
		                CreationDate: record.get('CreationDate'),
		                Project: record.get('FormattedID'),
		                Owner: record.get('_User'),
		                // State: record.get('State'),
		                // PercentDoneByStoryPlanEstimate: record.get('PercentDoneByStoryPlanEstimate'),
		                Removed: removed//,
		                //Parent: parentNames.get(record.get('Parent')),
		                // LeafStoryCount: record.get('LeafStoryCount'),
		                
		            });
		        }, this);

		        console.log('initItems:', initFeatures);
		        console.log('endFeatures:', endFeatures);
		        console.log('endStories:', endStories);
		        console.log('endDefects:', endDefects);

		        var endFeatureStore = Ext.create('Rally.data.custom.Store', {
		            data: endFeatures,
		            pageSize: 1000
		        });

		        var endStoriesStore = Ext.create('Rally.data.custom.Store', {
		            data: endStories,
		            pageSize: 1000
		        });

		        var endDefectStore = Ext.create('Rally.data.custom.Store', {
		            data: endDefects,
		            pageSize: 1000
		        });

				this.down('#bodyContainer').removeAll(true);

				if (this._searchParameter != 'i') {
			        this._buildAddedFeatureGrid(endFeatureStore);
			    }
		        this._buildAddedStoriesGrid(endStoriesStore);
		        this._buildAddedDefectsGrid(endDefectStore);

		        this.myMask.hide();

            },
            failure: function(error) {
                console.log('error:', error);
            },
            scope: this
        });
    },


    _findDataChanged: function() {

    },


    _buildAddedFeatureGrid: function(addedFeatureStore) {
    	var grid = Ext.create('Rally.ui.grid.Grid', {
			showRowActionsColumn: false,
			showPagingToolbar: false,
			enableEditing: false,
    		itemId : 'featureAdded',
    		store: addedFeatureStore,

    		columnCfgs: [
                {
                	xtype: 'templatecolumn',
                    text: 'ID',
                    dataIndex: 'FormattedID',
                    tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
                },
                {
                    text: 'Parent',
                    dataIndex: 'Parent',
                    flex: 3
                },
                {
                    text: 'PreliminaryEstimate',
                    dataIndex: 'PreliminaryEstimate',
                    flex: 1
                },
                {
                    text: 'Leaf Story Plan Estimate Total', 
                    dataIndex: 'LeafStoryPlanEstimateTotal',
                    flex: 1
                },
                {
                    text: 'Date Added', 
                    dataIndex: 'CreationDate',
                    flex: 2
                },
                {
                    text: 'Project', 
                    dataIndex: 'Project',
                    flex: 2
                },
                {
                	text: 'Owner', 
                    dataIndex: 'Owner',
                    flex: 2
                }
            ]
        });

		//this.add(grid);
		var mainPanel = Ext.create('Ext.panel.Panel', {
			title: 'Features Added',
			height: 250,
			autoScroll: true,
            layout: {
				type: 'vbox',
				align: 'stretch',
				padding: 5
			},
            padding: 5,
            itemId: 'featuresAdded',
            items: [
                grid
            ]
        });

		this.down('#bodyContainer').add(mainPanel);
    },


    _buildAddedStoriesGrid: function(addedStoryStore) {
    	var grid = Ext.create('Rally.ui.grid.Grid', {
			showRowActionsColumn: false,
			showPagingToolbar: false,
			enableEditing: false,
    		itemId : 'storyAdded',
    		store: addedStoryStore,

    		columnCfgs: [
                {
                	xtype: 'templatecolumn',
                    text: 'ID',
                    dataIndex: 'FormattedID',
                    tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
                },
                {
                    text: 'Parent',
                    dataIndex: 'Parent',
                    flex: 3
                },
                {
                    text: 'PlanEstimate',
                    dataIndex: 'PlanEstimate',
                    flex: 1
                },
                {
                    text: 'Date Added', 
                    dataIndex: 'CreationDate',
                    flex: 2
                },
                {
                    text: 'Project', 
                    dataIndex: 'Project',
                    flex: 2
                },
                {
                	text: 'Owner', 
                    dataIndex: 'Owner',
                    flex: 2
                }
            ]
        });

		//this.add(grid);
		var mainPanel = Ext.create('Ext.panel.Panel', {
			title: 'Stories Added',
			height: 250,
			autoScroll: true,
            layout: {
				type: 'vbox',
				align: 'stretch',
				padding: 5
			},
            padding: 5,
            itemId: 'storiesAdded',
            items: [
                grid
            ]
        });

		this.down('#bodyContainer').add(mainPanel);
    },


    _buildAddedDefectsGrid: function(addedDefectStore) {
    	var grid = Ext.create('Rally.ui.grid.Grid', {
			showRowActionsColumn: false,
			showPagingToolbar: false,
			enableEditing: false,
    		itemId : 'defectAdded',
    		store: addedDefectStore,

    		columnCfgs: [
                {
                	xtype: 'templatecolumn',
                    text: 'ID',
                    dataIndex: 'FormattedID',
                    tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
                },
                {
                    text: 'Parent',
                    dataIndex: 'Parent',
                    flex: 3
                },
                {
                    text: 'PlanEstimate',
                    dataIndex: 'PlanEstimate',
                    flex: 1
                },
                {
                    text: 'Date Added', 
                    dataIndex: 'CreationDate',
                    flex: 2
                },
                {
                    text: 'Project', 
                    dataIndex: 'Project',
                    flex: 2
                },
                {
                	text: 'Owner', 
                    dataIndex: 'Owner',
                    flex: 2
                }
            ]
        });

		//this.add(grid);
		var mainPanel = Ext.create('Ext.panel.Panel', {
			title: 'Defects Added',
			height: 250,
			autoScroll: true,
            layout: {
				type: 'vbox',
				align: 'stretch',
				padding: 5
			},
            padding: 5,
            itemId: 'defectsAdded',
            items: [
                grid
            ]
        });

		this.down('#bodyContainer').add(mainPanel);
    },


    _loadIterations: function(projectId){
		var iterations = [];
    	var deferred = Ext.create('Deft.Deferred');

    	//this recovers all iterations from a parent project given the iteration name.
    	Ext.create('Rally.data.wsapi.Store', {
		    model: 'Iteration',
		    autoLoad: true,
		    context: {
		        projectScopeUp: false,
		        projectScopeDown: true,
		        project: null //null to search all workspace
		    },
		    fetch: ['Description', 'Name', 'ObjectID'],
            limit: Infinity,

			filters: Rally.data.QueryFilter.or([

				Rally.data.QueryFilter.and([
					{
						property: 'Project.parent.ObjectID',
						value: projectId
					},
					{
						property: 'name',
						value: this._iterationName
					}	
				]),
				
				Rally.data.QueryFilter.and([
					{
						property: 'Project.parent.parent.ObjectID',
						value: projectId
					},
					{
						property: 'name',
						value: this._iterationName
					}	
				])
			]),

			listeners: {
		        load: function(store, data, success) {
		            //console.log('Store:', store);
		            console.log('Data:', data);

		            //this checks if the project is a leaf. 
		            //will return 0 child iterations if so. else will return all iterations id.
		            if (data.length > 0) {
		            	console.log('multiple releases found:', data);
			            var localIterations = [];

                        _.each(data, function(record) {
                            localIterations.push(record.get('ObjectID'));
                        });

				        iterations = localIterations;
				        console.log('iterations: ', iterations);
				    } else {
				    	console.log('single iteration  found, using baseiterationId:', this._iterationId);
				    	iterations = [this._iterationId];
				    }

				    deferred.resolve(iterations);
				}, scope: this
		    }
        });

        return deferred.promise;
    },



    _loadReleases: function(projectId) {
    	//clear relase filter:
    	var releases = [];
    	var deferred = Ext.create('Deft.Deferred');


    	//this recovers all releases from a parent project given the release name.
    	Ext.create('Rally.data.wsapi.Store', {
		    model: 'Release',
		    autoLoad: true,
		    context: {
		        projectScopeUp: false,
		        projectScopeDown: true,
		        project: null //null to search all workspace
		    },
		    fetch: ['Description', 'Name', 'ObjectID'],
            limit: Infinity,

			filters: Rally.data.QueryFilter.or([

				Rally.data.QueryFilter.and([
					{
						property: 'Project.parent.ObjectID',
						value: projectId
					},
					{
						property: 'name',
						value: this._releaseName
					}	
				]),
				
				Rally.data.QueryFilter.and([
					{
						property: 'Project.parent.parent.ObjectID',
						value: projectId
					},
					{
						property: 'name',
						value: this._releaseName
					}	
				])
			]),

			listeners: {
		        load: function(store, data, success) {
		            //console.log('Store:', store);
		            console.log('Data:', data);

		            //this checks if the project is a leaf. 
		            //will return 0 child releases if so. else will return all releases id.
		            if (data.length > 0) {
		            	console.log('multiple releases found:', data);
			            var localReleases = [];

			            _.each(data, function(record) {
				        	localReleases.push(record.get('ObjectID'));
				        });

				        releases = localReleases;
				        console.log('releases: ', releases);
				    } else {
				    	console.log('single release found, using baseReleaseId:', this._releaseId);
				    	releases = [this._releaseId];
				    }

				    deferred.resolve(releases);
				}, scope: this
		    }
        });

        return deferred.promise;
    },


    _loadParentNames: function(parentIds) {
        var parentNames = new Ext.util.MixedCollection();
        var deferred = Ext.create('Deft.Deferred');

        Ext.create('Rally.data.wsapi.Store', {
            model: 'PortfolioItem/Initiative',
            autoLoad: true,
            fetch: ['Name', 'ObjectID', 'FormattedID'],
            context: {
                projectScopeUp: false,
                projectScopeDown: true,
                project: null //null to search all workspace
            },
            filters: [{
                property: 'ObjectID',
                operator: 'in',
                value: parentIds
            }],
            limit: Infinity,
            listeners: {
                load: function(store, data, success) {
                    _.each(data, function(record) {
                        var parentName = record.get('FormattedID') + ' - ' + record.get('Name');
                        parentNames.add(record.get('ObjectID'), parentName);
                    });

                    deferred.resolve(parentNames);
                }
            }, scope: this
        });

        return deferred.promise;
    },


    _loadTestCaseNames: function(testCaseIds) {
        var deferred = Ext.create('Deft.Deferred');

        if (!testCaseIds || testCaseIds.length == 0) {
        	deferred.resolve();
            return deferred.promise;
        }

        var testCaseNames = new Ext.util.MixedCollection();

        Ext.create('Rally.data.wsapi.artifact.Store', {
            models: ['TestCase'],
            fetch: ['Name'],
            limit: Infinity,
            context: {
                projectScopeUp: false,
                projectScopeDown: true,
                project: null //null to search all workspace
            },
            filters: [{
                property: 'ObjectID',
                operator: 'in',
                value: testCaseIds
            }]
        }).load({
            callback: function(records, operation, success) {
                if (success) {
                    _.each(records, function(record) {
                        testCaseNames.add(record.get('ObjectID'), record.get('Name'));
                    });

                    deferred.resolve(testCaseNames);
                } else {
                    deferred.reject("Error loading testCase names.");
                }
            }
        });

        return deferred.promise;
    },


    _loadPreliminaryEstimates: function() {
        var estimates = new Ext.util.MixedCollection();
        var deferred = Ext.create('Deft.Deferred');

        Ext.create('Rally.data.wsapi.Store', {
            model: 'PreliminaryEstimate',
            autoLoad: true,
            fetch: ['Name', 'ObjectID', 'Value'],
            context: {
                projectScopeUp: false,
                projectScopeDown: true,
                project: null //null to search all workspace
            },
            limit: Infinity,
            listeners: {
                load: function(store, data, success) {
                    _.each(data, function(record) {
                        var estimateValue = record.get('Value');
                        estimates.add(record.get('ObjectID'), estimateValue);
                    });

                    deferred.resolve(estimates);
                }
            }, scope: this
        });

        return deferred.promise;
    },


    _loadUsers: function(userIds) {
        var users = new Ext.util.MixedCollection();
        var deferred = Ext.create('Deft.Deferred');

        Ext.create('Rally.data.wsapi.Store', {
            model: 'User',
            autoLoad: true,
            fetch: ['DisplayName', 'ObjectID'],
            context: {
                projectScopeUp: false,
                projectScopeDown: true,
                project: null //null to search all workspace
            },
            filters: [{
                property: 'ObjectID',
                operator: 'in',
                value: userIds
            }],
            limit: Infinity,
            listeners: {
                load: function(store, data, success) {
                	console.log('users', data);
                    _.each(data, function(record) {
                        var user = record.get('DisplayName');
                        users.add(record.get('ObjectID'), user);
                    });

                    deferred.resolve(users);
                }
            }, scope: this
        });

        return deferred.promise;
    }
});
