const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

const GOOGLE_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GITHUB_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Google Strategy
if (GOOGLE_ID && GOOGLE_SECRET && GOOGLE_ID !== '' && GOOGLE_SECRET !== '') {
    passport.use(new GoogleStrategy({
        clientID: GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
        callbackURL: "/api/auth/google/callback",
        proxy: true
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                    if (email) {
                        user = await User.findOne({ email });
                    }

                    if (user) {
                        user.googleId = profile.id;
                        await user.save();
                    } else {
                        user = await User.create({
                            name: profile.displayName,
                            email: email || `${profile.id}@google.com`,
                            googleId: profile.id,
                            isVerified: true,
                            role: 'employee'
                        });
                    }
                }
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    ));
} else {
    console.warn('⚠️ Google OAuth Strategy NOT loaded: Missing credentials');
}

// GitHub Strategy
if (GITHUB_ID && GITHUB_SECRET && GITHUB_ID !== '' && GITHUB_SECRET !== '') {
    passport.use(new GitHubStrategy({
        clientID: GITHUB_ID,
        clientSecret: GITHUB_SECRET,
        callbackURL: "/api/auth/github/callback",
        proxy: true
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ githubId: profile.id });

                if (!user) {
                    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;

                    user = await User.findOne({ email });

                    if (user) {
                        user.githubId = profile.id;
                        await user.save();
                    } else {
                        user = await User.create({
                            name: profile.displayName || profile.username,
                            email: email,
                            githubId: profile.id,
                            isVerified: true,
                            role: 'employee'
                        });
                    }
                }
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    ));
} else {
    console.warn('⚠️ GitHub OAuth Strategy NOT loaded: Missing credentials');
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;

