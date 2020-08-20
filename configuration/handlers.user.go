package configuration

import (
	"math/rand"
	"net/http"
	"strconv"

	vars "github.com/AnteZovko23/RestAPI-Go-MySQL/Library"

	"github.com/gin-gonic/gin"

	"context"
	"fmt"
	"time"

	"github.com/mailgun/mailgun-go"
)

var keys map[string]string
var key string

// ShowLoginPage ...
func ShowLoginPage(c *gin.Context) {
	// Call the Render function with the name of the template to Render
	Render(c, gin.H{
		"title": "Login",
	}, "loginImproved.html")
}

//ShowTest ...
func ShowTest(c *gin.Context) {
	// Call the Render function with the name of the template to Render
	Render(c, gin.H{
		"title": "Home",
	}, "test.html")
}

//ShowHomePage ...
func ShowHomePage(c *gin.Context) {
	// Call the Render function with the name of the template to Render
	Render(c, gin.H{
		"title": "Home",
	}, "index.html")
}

//SearchResult ...
func SearchResult(c *gin.Context) {
	// Call the Render function with the name of the template to Render
	Render(c, gin.H{
		"title": "Home",
	}, "searchResults.html")
}

// ShowResetPage ...
func ShowResetPage(c *gin.Context) {
	// Call the Render function with the name of the template to Render
	Render(c, gin.H{
		"title": "Reset",
	}, "improvedResetPass.html")
}

// PerformLogin ...
func PerformLogin(c *gin.Context) {

	username := c.PostForm("username")
	password := c.PostForm("password")

	if isUserValid(username, password) {

		token := generateSessionToken()
		c.SetCookie("token", token, 3600, "", "", false, true)
		c.Set("is_logged_in", true)

		c.Redirect(http.StatusTemporaryRedirect, "/inventory/homepage")

		keys = make(map[string]string)
		key = ""

	} else {

		c.HTML(http.StatusBadRequest, "loginImproved.html", gin.H{
			"ErrorTitle":   "Login Failed",
			"ErrorMessage": "Invalid credentials provided"})
	}
}

// PerformReset ...
func PerformReset(c *gin.Context) {

	email := c.PostForm("email")

	if isResetValid(email) {

		key = strconv.FormatInt(rand.Int63(), 16)

		keys = make(map[string]string)

		keys[key] = email

		sendSimpleMessage("domain", "apiKey", email, key)

		Render(c, gin.H{
			"title": "Success"}, "improvedResetWithKey.html")

	} else {

		c.HTML(http.StatusBadRequest, "improvedResetPass.html", gin.H{
			"ErrorTitle":   "Reset Failed",
			"ErrorMessage": "Invalid credentials provided"})
	}
}

// ResetWithKey ...
func ResetWithKey(c *gin.Context) {

	key := c.PostForm("key")
	password := hashAndSalt(getPwd(c.PostForm("password")))

	if isResetValid(keys[key]) {

		stmt, err := vars.Db.Prepare("update Users set Password = ? where Email = ?;")
		if err != nil {
			fmt.Println(err.Error())
		}

		_, err = stmt.Exec(password, keys[key])
		if err != nil {
			fmt.Println(err.Error())
		}

		Render(c, gin.H{
			"title": "Successful Reset"}, "success.html")
		keys = make(map[string]string)
		key = ""

	} else {

		c.HTML(http.StatusBadRequest, "improvedResetWithKey.html", gin.H{
			"ErrorTitle":   "Reset Failed",
			"ErrorMessage": "Invalid credentials provided"})

	}
}

func generateSessionToken() string {

	return strconv.FormatInt(rand.Int63(), 16)
}

// Logout ...
func Logout(c *gin.Context) {
	// Clear the cookie
	c.SetCookie("token", "", -1, "", "", false, true)

	c.Redirect(http.StatusTemporaryRedirect, "/inventory/login")

}

// ShowRegistrationPage ...
func ShowRegistrationPage(c *gin.Context) {
	// Call the Render function with the name of the template to Render
	Render(c, gin.H{
		"title": "Register"}, "registerImproved.html")
}

// Register ...
func Register(c *gin.Context) {

	username := c.PostForm("username")
	password := hashAndSalt(getPwd(c.PostForm("password")))
	email := c.PostForm("email")
	gender := c.PostForm("gender")
	bday := c.PostForm("bday")

	if _, err := registerNewUser(username, password, email, gender, bday); err == nil {

		token := generateSessionToken()
		c.SetCookie("token", token, 3600, "", "", false, true)
		c.Set("is_logged_in", true)

		c.Redirect(http.StatusTemporaryRedirect, "/inventory/homepage")

	} else {

		c.HTML(http.StatusBadRequest, "registerImproved.html", gin.H{
			"ErrorTitle":   "Registration Failed",
			"ErrorMessage": err.Error()})

	}
}
func sendSimpleMessage(domain, apiKey, email, key string) (string, error) {
	mg := mailgun.NewMailgun(domain, apiKey)
	m := mg.NewMessage(
		"Mailgun Sandbox <postmaster@domain>",
		"Hello, ",
		"This is your key "+key,
		email,
	)
	// zaz934327@gmail.com
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()

	_, id, err := mg.Send(ctx, m)
	return id, err
}

// Render ...
func Render(c *gin.Context, data gin.H, templateName string) {
	loggedInInterface, _ := c.Get("is_logged_in")
	data["is_logged_in"] = loggedInInterface.(bool)

	switch c.Request.Header.Get("Accept") {
	case "application/json":
		// Respond with JSON
		c.JSON(http.StatusOK, data["payload"])
	case "application/xml":
		// Respond with XML
		c.XML(http.StatusOK, data["payload"])
	default:
		// Respond with HTML
		c.HTML(http.StatusOK, templateName, data)
	}
}
