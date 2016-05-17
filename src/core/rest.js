/**
 * @file PipServices Rest API
 * @copyright Digital Living Software Corp. 2014-2016
 * @todo:
 * - Separate application and administrative APIs
 */

(function () {
    'use strict';

    var thisModule = angular.module('pipRest', [
        'ngResource',  
        'pipRest.Enums', 'pipRest.Access',
        'pipRest.Session', 'pipRest.State'
    ]);

    thisModule.provider('pipRest', function($httpProvider) {
        var serverUrl = '';
        var serverUrlFixed = false;
        
        var api = [];
        
        this.addApi = addApi;
        
        function addApi(extension) {
            for (var call in extension) {
                api[call] = extension[call];
            }
        };

        // Set default API version
        $httpProvider.defaults.headers.common['api-version'] = '1.0';


        this.version = function (newVersion) {
            if (newVersion)
                $httpProvider.defaults.headers.common['api-version'] = newVersion;
            return $httpProvider.defaults.headers.common['api-version'];
        };

        this.serverUrlFixed = function (value) {
            if (value === true || value === 'on' )
                serverUrlFixed = value;
            return serverUrlFixed;
        };

        this.serverUrl = function (newServerUrl) {
            if (newServerUrl)
                serverUrl = newServerUrl;
            return newServerUrl;
        };

        this.$get = function ($rootScope, $http, $resource) {

            function createResource(url, path, paramDefaults, actions) {
                url = url || serverUrl;
                return $resource(url + path, paramDefaults, actions);
            };
    
            function createOperation(url, path) {
                url = url || serverUrl;
                return $resource(url + path, {},
                    {
                        call: {method: 'POST'}
                    }
                );
            };
    
            function createCollection(url, path, paramDefaults) {
                url = url || serverUrl;
                return $resource(url + path,
                    paramDefaults || { id: '@id' },
                    {
                        update: {method: 'PUT'}
                    }
                );
            };
    
            function createPagedCollection(url, path, paramDefaults) {
                url = url || serverUrl;
                return $resource(url + path,
                    paramDefaults || { id: '@id' },
                    {
                        page: {method: 'GET', isArray: false},
                        update: {method: 'PUT'}
                    }
                );
            };
    
            function createPartyCollection(url, path, paramDefaults) {
                return createPagedCollection(url, path, paramDefaults ||
                    {
                        id: '@id',
                        party_id: '@party_id'
                    }
                );
            };

           var restApi = {
                version: function (newVersion) {
                    if (newVersion)
                        $httpProvider.defaults.headers.common['api-version'] = newVersion;
                    return $httpProvider.defaults.headers.common['api-version'];
                },

                serverUrl: function (newServerUrl) {
                    if (newServerUrl) {
                        serverUrl = newServerUrl;
                    }
                    return serverUrl;
                },

                userId: function () {
                    return $http.defaults.headers.common['user-id'];
                },

                serverUrlFixed: function() {
                    return serverUrlFixed;
                },

                sessionId: function () {
                    return $http.defaults.headers.common['session-id'];
                },

                // Used in routing
                partyId: function ($stateParams) {
                    return $stateParams.party_id || $http.defaults.headers.common['user-id'];
                },

                about: function (url) {
                    return createResource(url, '/api/about');
                },

                session: function (userId, sessionId) {
                    $http.defaults.headers.common['session-id'] = sessionId;
                    $http.defaults.headers.common['user-id'] = userId;
                },

                signin: function (url) {
                    return createOperation(url, '/api/signin');
                },

                signout: function (url) {
                    return createOperation(url, '/api/signout');
                },

                signup: function (url) {
                    return createOperation(url, '/api/signup');
                },

                recoverPassword: function (url) {
                    return createOperation(url, '/api/recover_password');
                },

                resetPassword: function (url) {
                    return createOperation(url, '/api/reset_password');
                },

                changePassword: function (url) {
                    return createOperation(url, '/api/change_password');
                },

                requestEmailVerification: function (url) {
                    return createCollection(url, '/api/users/:party_id/resend_email_verification');
                },

                verifyEmail: function (url) {
                    return createOperation(url, '/api/verify_email');
                },

                signupValidate: function (url) {
                    return createOperation(url, '/api/signup_validate');
                },

                users: function (url) {
                    return createPagedCollection(url, '/api/users/:id');
                },

                currentUser: function (url) {
                    return createResource(url, '/api/users/current',
                        {},
                        {
                            get: {method: 'GET', isArray: false}
                        }
                    );
                },

                userSessions: function (url) {
                    return createPartyCollection(url, '/api/users/:party_id/sessions/:id');
                },


                parties: function (url) {
                    return createPagedCollection(url, '/api/parties/:id');
                },

                //
                // inviteParty: function (url) {
                //     return createPagedCollection(url, '/api/parties/:id/invite');
                // },
                //
                // partyActivities: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/activities');
                // },
                //
                partySettings: function (url) {
                    return createPartyCollection(url, '/api/parties/:party_id/settings');
                },
                //
                // partyTags: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/tags');
                // },

                serverActivities: function (url) {
                    return createPagedCollection(url, '/api/servers/activities/:id');
                },

                // connectionBlocks: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/blocks/:id');
                // },
                //
                // connectionSuggestions: function (url) {
                //     return createCollection(url, '/api/parties/:party_id/connections/suggestions',
                //         {
                //             party_id: '@party_id'
                //         }
                //     );
                // },
                //
                
                // TBD: REFACTOR SESSION_CACHE AND MOVE OUT OF HERE
                connections: function (url) {
                    return createPartyCollection(url, '/api/parties/:party_id/connections/:id');
                },
                //
                // // Todo: Deprecated operation
                // managedConnections: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/connections/managed');
                // },
                //
                // // Todo: Deprecated operation. Use party_access from user object instead
                // collaborators: function (url) {
                //     return createCollection(url, '/api/parties/:party_id/collaborators/:to_party_id',
                //         {
                //             to_party_id: '@to_party_id',
                //             party_id: '@party_id'
                //         }
                //     );
                // },
                //
                // partners: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/partners/:id');
                // },
                //
                // acceptPartner: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/partners/:id/accept');
                // },
                //
                // members: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/members/:id');
                // },
                //
                // acceptMember: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/members/:id/accept');
                // },
                //
                // following: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/following/:id');
                // },
                //
                // followers: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/followers/:id');
                // },
                //
                // groups: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/groups/:id');
                // },
                //
                // contacts: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/contacts/:id');
                // },
                //
                // getOwnContacts: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/contacts/own');
                // },
                //
                // quotes: function (url) {
                //     return createPagedCollection(url, '/api/quotes/:id');
                // },
                //
                // randomQuote: function (url) {
                //     return createResource(url, '/api/quotes/random');
                // },
                //
                guides: function (url) {
                    return createPagedCollection(url, '/api/guides/:id');
                },

                tips: function (url) {
                    return createPagedCollection(url, '/api/tips/:id');
                },

                image_sets: function (url) {
                    return createPagedCollection(url, '/api/image_sets/:id');
                },

                images: function (url) {
                    return createPagedCollection(url, '/api/images/search');
                },

                // notes: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/notes/:id');
                // },
                //
                // // Todo: This operation is deprecated. Use contributors management instead
                // sendNote: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/notes/:id/send');
                // },

                feedbacks: function (url) {
                    return createPartyCollection(url, '/api/feedbacks/:id');
                },

                // feeds: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/feeds/:id');
                // },

                // publicPosts: function (url) {
                //     return createCollection(url, '/api/posts/:id');
                // },
                //
                // posts: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/posts/:id');
                // },
                //
                // allFeedPosts: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/feeds/posts/:id');
                // },
                //
                // feedPosts: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/feeds/:feed_id/posts/:id',
                //         {
                //             id: '@id',
                //             party_id: '@party_id',
                //             feed_id: '@feed_id'
                //         }
                //     );
                // },
                //
                // // Todo: Move under party  /api/parties/:party_id/posts/:post_id/comments
                // postComments: function (url) {
                //     return createCollection(url, '/api/parties/:party_id/posts/:id/comments/:comment_id',
                //         {
                //             party_id: '@party_id',
                //             id: '@id',
                //             comment_id: '@comment_id'
                //         }
                //     );
                // },
                //
                // postCheers: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/posts/:post_id/cheers',
                //         {
                //             party_id: '@party_id',
                //             post_id: '@post_id'
                //         }
                //     );
                // },
                //
                // postBoos: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/posts/:post_id/boos',
                //         {
                //             party_id: '@party_id',
                //             post_id: '@post_id'
                //         }
                //     );
                // },
                //
                // events: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/events/:id');
                // },
                //
                // acceptEvent: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/events/:id/accept');
                // },
                //
                // rejectEvent: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/events/:id/reject');
                // },
                //
                // acceptVision: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/visions/:id/accept');
                // },
                //
                // rejectVision: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/visions/:id/reject');
                // },
                //
                // messages: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/messages/:id');
                // },
                //
                // receivedMessages: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/messages/received',
                //         {
                //             party_id: '@party_id'
                //         }
                //     );
                // },
                //
                // receivedManagedMessages: function (url) {
                //     return createCollection(url, '/api/parties/:party_id/messages/received/managed',
                //         {
                //             party_id: '@party_id'
                //         }
                //     );
                // },
                //
                // sentMessages: function (url) {
                //     return createCollection(url, '/api/parties/:party_id/messages/sent',
                //         {
                //             party_id: '@party_id'
                //         }
                //     );
                // },
                //
                // viewMessage: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/messages/:id/view');
                // },
                //
                // sentManagedMessages: function (url) {
                //     return createCollection(url, '/api/parties/:party_id/messages/sent/managed',
                //         {
                //             party_id: '@party_id'
                //         }
                //     );
                // },
                //
                // notifications: function (url) {
                //     return createCollection(url, '/api/parties/:party_id/notifications',
                //         {
                //             party_id: '@party_id'
                //         }
                //     );
                // },
                //
                // // Todo: Add party?
                // managedNotifications: function (url) {
                //     return createCollection(url, '/api/parties/:party_id/notifications/managed', {
                //         party_id: '@party_id'
                //     });
                // },
                //
                // areas: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/areas/:id');
                // },
                //
                // acceptArea: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/areas/:id/accept');
                // },
                //
                // rejectArea: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/areas/:id/reject');
                // },
                //
                // goals: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/goals/:id');
                // },
                //
                // acceptGoal: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/goals/:id/accept');
                // },
                //
                // rejectGoal: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/goals/:id/reject');
                // },
                //
                // visions: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/visions/:id');
                // },
                //
                // // Todo: This one doesn't exist on the server
                // collages: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/collages/:id');
                // },
                //
                // partySupportCases: function (url) {
                //     return createPartyCollection(url, '/api/parties/:party_id/support_cases/:id');
                // },
                //
                // supportCases: function (url) {
                //     return createPagedCollection(url, '/api/support_cases/:id');
                // },

                announces: function (url) {
                    return createPagedCollection(url, '/api/announcements/:id');
                },

                // stats: function (url) {
                //     return createPagedCollection(url, '/api/parties/:party_id/counters');
                // },
                //
                // eventContribManage: function (url) {
                //     return createPagedCollection(url, '/api/parties/:party_id/events/:id/manage_contrib',
                //         {
                //             id: '@id',
                //             party_id: '@party_id'
                //         }
                //     );
                // },
                //
                // areaContribManage: function (url) {
                //     return createPagedCollection(url, '/api/parties/:party_id/areas/:id/manage_contrib',
                //         {
                //             id: '@id',
                //             party_id: '@party_id'
                //         }
                //     );
                // },
                //
                // goalContribManage: function (url) {
                //     return createPagedCollection(url, '/api/parties/:party_id/goals/:id/manage_contrib',
                //         {
                //             id: '@id',
                //             party_id: '@party_id'
                //         }
                //     );
                // },
                //
                // visionContribManage: function (url) {
                //     return createPagedCollection(url, '/api/parties/:party_id/visions/:id/manage_contrib',
                //         {
                //             id: '@id',
                //             party_id: '@party_id'
                //         }
                //     );
                // },
                //
                // noteContribManage: function (url) {
                //     return createPagedCollection(url, '/api/parties/:party_id/notes/:id/manage_contrib',
                //         {
                //             id: '@id',
                //             party_id: '@party_id'
                //         }
                //     );
                // },

                // for testing
                //--------------

                createResource: createResource,
                createOperation: createOperation,
                createCollection: createCollection,
                createPagedCollection: createPagedCollection,
                createPartyCollection: createPartyCollection

            };
            
            function addApi() {
                for (var call in api) {
                    restApi[call] = api[call];
                }
            };
            
            addApi();
        
        
            return restApi;
        };
    });

})();
