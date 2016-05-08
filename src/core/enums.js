/**
 * @file Rest API enumerations service
 * @copyright Digital Living Software Corp. 2014-2016
 */
 
 /* global _, angular */

(function () {
    'use strict';

    var thisModule = angular.module('pipRest.Enums', []);

    thisModule.factory('pipEnums', function () {

        var enums = {};
    
        // Converts enumeration values to string array
        function enumToArray(obj) {
            var result = [];
    
            for (var key in obj)
                if (obj.hasOwnProperty(key))
                    result.push(obj[key]);

            return result;
        };
    
        enums.SHARE_LEVEL = {
            WORLD: 0, // Everyone
            OUTER: 1, // Familiar
            INNER: 2, // Trusted
            PRIVATE: 3 // Private
        };
    
        enums.URGENCY = {
            LOW: 1,
            NORMAL: 500,
            HIGH: 1000,
            MIN: 0,
            MAX: 1000
        };
        enums.URGENCIES = enumToArray(enums.URGENCY);
    
        enums.IMPORTANCE = {
            LOW: 1,
            NORMAL: 500,
            HIGH: 1000,
            MIN: 0,
            MAX: 1000
        };
        enums.IMPORTANCES = enumToArray(enums.IMPORTANCE);
    
        enums.CONFIDENTIALITY = {
            PUBLIC: 0, // No sharing restrictions level - ANY, groups = yes, parties = yes
            SENSITIVE: 1, // No public sharing - level >= OUTER, groups = yes, parties = yes
            CLASSIFIED: 2, // Only selected parties - level = PRIVATE, groups = yes, parties = yes
            SECRET: 3 // No sharing - level = PRIVATE, groups = no, parties = no
        };
        enums.CONFIDENTIALITIES = enumToArray(enums.CONFIDENTIALITY);
    
        enums.LEVEL = {
            NONE: 0,
            LOW: 1,
            LOW_MEDIUM: 250,
            MEDIUM: 500,
            MEDIUM_HIGH: 750,
            HIGH: 1000,
            MIN: 0,
            MAX: 1000
        };
    
        enums.LANGUAGE = {
            ENGLISH: 'en',
            SPANISH: 'es',
            PORTUGUESE: 'pt',
            FRENCH: 'fr',
            GERMAN: 'de',
            RUSSIAN: 'ru'
        };
        enums.LANGUAGES = enumToArray(enums.LANGUAGE);
    
        enums.STAT_TYPE = {
            DAILY: 'daily',
            MONTHLY: 'monthly',
            YEARLY: 'yearly',
            TOTAL: 'total'
        };
        enums.STAT_TYPES = enumToArray(enums.STAT_TYPE);
    
        enums.STAT_BATCH_OPERATION = {
            RECORD_SYSTEM_STATS: 'record system stats',
            RECORD_PARTY_STATS: 'record party stats'
        };
    
        enums.SERVER_TYPE = {
            REALTIME_DB: 'r/t db master',
            HISTORIAN_DB: 'db slave',
            ANALYTICS: 'analytics',
            BUSINESS_LOGIC: 'business logic',
            REST_API: 'rest api',
            STATIC_CONTENT: 'static content',
            BACKUP_STORAGE: 'backup storage'
        };
        enums.SERVER_TYPES = enumToArray(enums.SERVER_TYPE);
    
        enums.SYSTEM_LOG_TYPE = {
            INFO: 'info',
            STOP: 'stop',
            START: 'start',
            RESTART: 'restart',
            UPGRADE: 'upgrade',
            MAINTENANCE: 'maintenance',
            WARNING: 'warning',
            ERROR: 'error'
        };
        enums.SYSTEM_LOG_TYPES = enumToArray(enums.SYSTEM_LOG_TYPE);
    
        enums.ACTIVITY_TYPE = {
            SIGNUP: 'signup',
            SIGNIN: 'signin',
            PASSWORD_CHANGED: 'password changed',
            PWD_RECOVERED: 'pwd recovered',
            EMAIL_VERIFIED: 'email verified',
            SETTINGS_CHANGED: 'settings changed',
            PARTNERED: 'partnered',
            TEAMED_UP: 'teamed up',
            FOLLOWED: 'followed',
            DISCONNECTED: 'disconnected',
            CREATED: 'created',
            UPDATED: 'updated',
            DELETED: 'deleted',
            ACCEPTED: 'accepted',
            REJECTED: 'rejected',
            JOINED: 'joined',
            COMPLETED: 'completed',
            CANCELED: 'canceled',
            PROGRESS: 'progress',
            POSTED: 'posted',
            BUZZED: 'buzzed',
            COMMENTED: 'commented',
            CHEERED: 'cheered',
            BOOED: 'booed'
        };
        enums.ACTIVITY_TYPES = enumToArray(enums.ACTIVITY_TYPE);
    
        enums.REFERENCE_TYPE = {
            PARTY: 'party',
            CONNECTION: 'connection',
            CONTACT: 'contact',
            MESSAGE: 'message',
            NOTE: 'note',
            AREA: 'area',
            GOAL: 'goal',
            EVENT: 'event',
            VISION: 'vision',
            COLLAGE: 'collage',
            POST: 'post',
            SUPPORT_CASE: 'support case',
            ANNOUNCE: 'announce',
            IMAGE_SET: 'image set',
            FEEDBACK: 'feedback',
            GUIDE: 'guide'
        };
        enums.REFERENCE_TYPES = enumToArray(enums.REFERENCE_TYPE);
    
        enums.CONTENT_TYPE = {
            TEXT: 'text',
            CHECKLIST: 'checklist',
            LOCATION: 'location',
            TIME: 'time',
            PICTURES: 'pictures',
            DOCUMENTS: 'documents'
        };
        enums.CONTENT_TYPES = enumToArray(enums.CONTENT_TYPE);
    
        enums.PARTY_TYPE = {
            PERSON: 'person',
            TEAM: 'team',
            AGENT: 'agent'
        };
        enums.PARTY_TYPES = enumToArray(enums.PARTY_TYPE);
    
        enums.GENDER = {
            MALE: 'male',
            FEMALE: 'female',
            NOT_SPECIFIED: 'n/s'
        };
        enums.GENDERS = enumToArray(enums.GENDER);
    
        enums.VISION_TYPE = {
            OVERALL: 'overall',
            ROLE: 'role',
            MODEL: 'model',
            TIME: 'time'
        };
        enums.VISION_TYPES = enumToArray(enums.VISION_TYPE);
    
        enums.AREA_TYPE = {
            CATEGORY: 'category',
            AREA: 'area'
        };
        enums.AREA_TYPES = enumToArray(enums.AREA_TYPE);
    
        enums.GOAL_TYPE = {
            GOAL: 'goal',
            OBJECTIVE: 'objective',
            DREAM: 'dream',
            //ASPIRATION: 'aspiration',
            ACCOMPLISHMENT: 'accomplishment',
            //CHORE: 'chore',
            //HABIT: 'habit',
            TASK: 'task',
            ROUTINE: 'routine'
        };
        enums.GOAL_TYPES = enumToArray(enums.GOAL_TYPE);
    
        enums.PROCESS_NODE = {
            START: 'start',
            END: 'end',
            EVENT: 'event',
            AWAIT: 'await',
            DECISION: 'decision',
            ACTIVITY: 'activity'
        };
        enums.PROCESS_NODES = enumToArray(enums.PROCESS_NODE);
    
        enums.CALCULATION_METHOD = {
            LAST_VALUE: 'last value',
            SUM: 'sum',
            MAX: 'max',
            MIN: 'min',
            AVERAGE: 'average'
        };
        enums.CALCULATION_METHODS = enumToArray(enums.CALCULATION_METHOD);
    
        enums.EXECUTION_STATUS = {
            NEW: 'new',
            ASSIGNED: 'assigned',
            IN_PROGRESS: 'in progress',
            VERIFYING: 'verifying',
            ON_HOLD: 'on hold',
            CANCELED: 'canceled',
            COMPLETED: 'completed'
        };
        enums.EXECUTION_STATUSES = enumToArray(enums.EXECUTION_STATUS);
    
        enums.CONTRIBUTOR_ROLE = {
            UNDEFINED: 'undefined',
            RESPONSIBLE: 'responsible',
            ACCOUNTABLE: 'accountable',
            CONSULTED: 'consulted',
            INFORMED: 'informed'
        };
        enums.CONSTRIBUTOR_ROLES = enumToArray(enums.CONTRIBUTOR_ROLE);
    
        enums.ACCEPTANCE = {
            JOINED: 'joined',
            INVITED: 'invited',
            ACCEPTED: 'accepted'
            //REJECTED: 'rejected'
        };
        enums.ACCEPTANCES = enumToArray(enums.ACCEPTANCE);
    
        enums.ACCEPT_ACTION = {
            INVITE: 'invite',
            JOIN: 'join',
            ACCEPT: 'accept',
            REJECT: 'reject'
        };
        enums.ACCEPT_ACTIONS = enumToArray(enums.ACCEPT_ACTION);
    
        enums.JOIN_METHOD = {
            INVITE: 'invite',
            APPROVE: 'approve',
            OPEN: 'open'
        };
        enums.JOIN_METHODS = enumToArray(enums.JOIN_METHOD);
    
        enums.SKILL_LEVEL = {
            NOVICE: 'novice',
            INTERMEDIATE: 'intermediate',
            ADVANCED: 'advanced',
            EXPERT: 'expert'
        };
        enums.SKILL_LEVELS = enumToArray(enums.SKILL_LEVEL);
    
        enums.FEEDBACK_TYPE = {
            SUPPORT: 'support',
            TEAM: 'team',
            MEETUP: 'meetup',
            COPYRIGHT: 'copyright',
            BUSINESS: 'business',
            ADVERTISEMENT: 'ad'
        };
        enums.FEEDBACK_TYPES = enumToArray(enums.FEEDBACK_TYPE);
    
        enums.NOTE_CATEGORY = {
            GENERAL: 'general',
            UNFINISHED: 'unfinished',
            ULTIMATE_TODO: 'ultimate todo'
        };
        enums.NOTE_CATEGORIES = enumToArray(enums.NOTE_CATEGORY);
    
        enums.CONNECTION_TYPE = {
            PARTNER: 'partner',
            MEMBER: 'member',
            FOLLOW: 'follow',
            AUTOMATION: 'automation'
        };
        enums.CONNECTION_TYPES = enumToArray(enums.CONNECTION_TYPE);
    
        enums.EVENT_TYPE = {
            INSTANCE: 'instance',
            RECURRENCE: 'recurrence',
            AUTO_INSTANCE: 'auto',
            TIME_ENTRY: 'time entry'
        };
        enums.EVENT_TYPES = enumToArray(enums.EVENT_TYPE);
    
        enums.EVENT_CATEGORY = {
            DAILY: 'daily',
            WEEKLY: 'weekly',
            MONTHLY: 'monthly',
            YEARLY: 'yearly'
            //    COULDDO: 'coulddo'
        };
        enums.EVENT_CATEGORIES = enumToArray(enums.EVENT_CATEGORY);
    
        enums.COMMENT_TYPE = {
            BUZZ: 'buzz',
            CHEER: 'cheer',
            BOO: 'boo',
            COMMENT: 'comment'
        };
        enums.COMMENT_TYPES = enumToArray(enums.COMMENT_TYPE);
    
        enums.POST_TYPE = {
            INFO: 'info',
            QUESTION: 'question',
            ISSUE: 'issue',
            REPORT: 'report',
            FORECAST: 'forecast'
        };
        enums.POST_TYPES = enumToArray(enums.POST_TYPE);
    
        enums.MESSAGE_TYPE = {
            REGULAR: 'regular',
            EMAIL: 'email',
            INVITATION: 'invitation'
        };
        enums.MESSAGE_TYPES = enumToArray(enums.MESSAGE_TYPE);
    
        enums.NOTIFICATION_TYPE = {
            GREETING: 'greeting',
            MESSAGE: 'message',
    
            PARTNER_INVITE: 'partner invite',
            PARTNER_RESPONSE_ACCEPTED: 'partner response accepted',
            PARTNER_RESPONSE_REJECTED: 'partner response rejected',
            PARTNER_JOINED: 'partner joined',
            MEMBER_INVITE: 'member invite',
            MEMBER_REQUEST: 'member request',
            MEMBER_RESPONSE_ACCEPTED: 'member response accepted',
            MEMBER_RESPONSE_REJECTED: 'member response rejected',
            MEMBER_JOINED: 'member joined',
            FOLLOWER_JOINED: 'follower joined',
    
            ENTITY_REQUEST: 'entity request',
            ENTITY_REQUEST_ACCEPTED: 'entity request accepted',
            ENTITY_REQUEST_REJECTED: 'entity request rejected',
            ENTITY_INVITE: 'entity invite',
            ENTITY_INVITE_ACCEPTED: 'entity invite accepted',
            ENTITY_INVITE_REJECTED: 'entity invite rejected',
            ENTITY_JOINED: 'entity joined',
    
            VERIFY_EMAIL: 'verify email',
            COMPLETE_PROFILE: 'complete profile'
        };
        enums.NOTIFICATION_TYPES = enumToArray(enums.NOTIFICATION_TYPE);
    
        enums.NOTIFICATION_BATCH_OPERATION = {
            CREATE: 'create',
            REPLY: 'reply',
            CLOSE: 'close',
            DELETE: 'delete'
        };
    
        enums.SUPPORT_CASE_CATEGORY = {
            ACCOUNT: 'account',
            BILLING: 'billing',
            TECHNICAL: 'technical',
            GENERAL: 'general'
        };
        enums.SUPPORT_CASE_CATEGORIES = enumToArray(enums.SUPPORT_CASE_CATEGORY);
    
        enums.ANNOUNCE_TYPE = {
            APP: 'app',
            EMAIL: 'email',
            APP_AND_EMAIL: 'app and email'
        };
        enums.ANNOUNCE_TYPES = enumToArray(enums.ANNOUNCE_TYPE);
    
        enums.ANNOUNCE_CATEGORY = {
            GENERAL: 'general',
            MAINTENANCE: 'maintenance',
            NEW_RELEASE: 'new release',
            SURVEY: 'survey'
        };
        enums.ANNOUNCE_CATEGORIES = enumToArray(enums.ANNOUNCE_CATEGORY);
    
        enums.GUIDE_TYPE = {
            INTRO: 'intro',
            TOPIC: 'topic',
            CONTEXT: 'context',
            TIP: 'tip',
            NEW_RELEASE: 'new release'
        };
        enums.GUIDE_TYPES = enumToArray(enums.GUIDE_TYPE);
    
        enums.EMAIL_TYPE = {
            HOME: 'home',
            WORK: 'work',
            OTHER: 'other'
        };
        enums.EMAIL_TYPES = enumToArray(enums.EMAIL_TYPE);
    
        enums.ADDRESS_TYPE = {
            HOME: 'home',
            WORK: 'work',
            OTHER: 'other'
        };
        enums.ADDRESS_TYPES = enumToArray(enums.ADDRESS_TYPE);
    
        enums.ADDRESS_TYPE = {
            HOME: 'home',
            WORK: 'work',
            OTHER: 'other'
        };
        enums.ADDRESS_TYPES = enumToArray(enums.ADDRESS_TYPE);
    
        enums.PHONE_TYPE = {
            MOBILE: 'mobile',
            WORK: 'work',
            HOME: 'home',
            MAIN: 'main',
            WORK_FAX: 'work fax',
            HOME_FAX: 'home fax',
            OTHER: 'other'
        };
        enums.PHONE_TYPES = enumToArray(enums.PHONE_TYPE);
    
        enums.MESSANGER_TYPE = {
            SKYPE: 'skype',
            GOOGLE_TALK: 'google talk',
            AIM: 'aim',
            YAHOO: 'yahoo',
            QQ: 'qq',
            MSN: 'msn',
            ICQ: 'icq',
            JABBER: 'jabber',
            OTHER: 'other'
        };
        enums.MESSANGER_TYPES = enumToArray(enums.MESSANGER_TYPE);
    
        enums.WEB_ADDRESS_TYPE = {
            PROFILE: 'profile',
            BLOG: 'blog',
            HOME_PAGE: 'home page',
            WORK: 'work',
            PORTFOLIO: 'portfolio',
            OTHER: 'other'
        };
        enums.WEB_ADDRESS_TYPES = enumToArray(enums.WEB_ADDRESS_TYPE);
    
        enums.DASHBOARD_TILE_SIZE = {
            SMALL: 'small',
            WIDE: 'wide',
            LARGE: 'large'
        };
        enums.DASHBOARD_TILE_SIZES = enumToArray(enums.DASHBOARD_TILE_SIZE);

        return enums;
    });
    
})();
