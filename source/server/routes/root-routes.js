const express = require('express');
const router = express.Router();
const { Permissions, Client } = require('discord.js');
const settings = require('../settings');
const passport = require('passport');
const botConfig = require('../../../config/bot.json');
const client = require('../../index').client;
const db = require('quick.db');

const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/login")
}

router.get("/", (req, res) => {
    res.render('index', {
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        bot: client,
        permissions: Permissions,
        websiteconfig: settings.webiste,
        collback: settings.config.collback,
        botconfig: botConfig,
    });
});

router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        req.logout();
        res.redirect("/");
    })
});

router.get("/callback", passport.authenticate("discord", { fallureRedirect: "/" }), async(req, res) => {
    res.redirect('/dashboard');
});

router.get("/dashboard", (req, res) => {
    if (!req.isAuthenticated() || !req.user) return res.redirect(`/?error=` + encodeURIComponent("You_Must_Login_In_The_Dashboard_first"));
    if (!req.user.guilds) return res.redirect(`/?error=` + encodeURIComponent("Dashboard_Can't_Get_Your_Guilds_Data"));
    res.render('dashboard', {
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        bot: client,
        permissions: Permissions,
        websiteconfig: settings.webiste,
        collback: settings.config.collback,
        botconfig: botConfig
    });
});

router.get("/commands", (req, res) => {
    res.render('commands', {
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        bot: client,
        db: db,
        botconfig: botConfig,
    });
});

router.get("/dashboard/:guildID", checkAuth, async(req, res) => {
    const guild = client.guilds.cache.find(g => g.id == req.params.guildID);
    if (!guild) return res.render('errors/307');
    let user = guild.members.cache.find(u => u.id == req.user.id);
    if (!user) {
        user = await guild.members.fetch(req.user.id).then(u => {
            if (!u) {
                return res.render('errors/308');
            }
        });
    }
    if (!user.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return res.render('errors/309');

    res.render('settings', {
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        guild: guild,
        db: db,
        bot: client,
        permissions: Permissions,
        websiteconfig: settings.webiste,
        collback: settings.config.collback,
        botconfig: botConfig,
    });
});

router.get("/features", (req, res) => {
    res.render('features', {
        req: req,
        user: req.isAuthenticated() ? req.user : null,
        bot: client,
        db: db,
        botconfig: botConfig,
    })
});

router.get("*", (req, res) => {
    res.render('errors/404')
});

module.exports = router;