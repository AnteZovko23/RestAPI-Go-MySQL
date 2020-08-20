package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	configuration "github.com/AnteZovko23/RestAPI-Go-MySQL/configuration"

	vars "github.com/AnteZovko23/RestAPI-Go-MySQL/Library"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

func main() {
	tables := []string{"Computers", "Furniture", "Printers", "Supplies", "Warehouse"}

	m := map[string]struct {
		Name        string
		Description string
		Category    string
		Barcode     int
	}{"Computers": vars.ComputerItem, "Furniture": vars.FurnitureItem, "Printers": vars.PrinterItem, "Supplies": vars.SupplyItem, "Warehouse": vars.WarehouseItem}

	vars.Db, vars.Err = sql.Open("mysql", "root:ChoosePassword@tcp(127.0.0.1:3306)/CompanyInventory")
	if vars.Err != nil {
		fmt.Print(vars.Err.Error())
	}

	defer vars.Db.Close()

	vars.Err = vars.Db.Ping()
	if vars.Err != nil {
		fmt.Print(vars.Err.Error())
	}

	router := gin.Default()

	router.Use(configuration.SetUserStatus())

	router.Use(static.Serve("/assets", static.LocalFile("./Templates", false)))

	router.LoadHTMLGlob("Templates/HTML/*.html")

	users := router.Group("/inventory")

	users.GET("/searchResult", configuration.EnsureLoggedIn(), configuration.SearchResult)

	users.GET("/test", configuration.ShowTest)

	users.GET("/register", configuration.EnsureNotLoggedIn(), configuration.ShowRegistrationPage)

	users.POST("/homepage", configuration.EnsureLoggedIn(), configuration.ShowHomePage)

	users.GET("/homepage", configuration.EnsureLoggedIn(), configuration.ShowHomePage)

	users.POST("/register", configuration.EnsureNotLoggedIn(), configuration.Register)

	users.POST("/login", configuration.EnsureNotLoggedIn(), configuration.PerformLogin)

	users.POST("/reset", configuration.EnsureNotLoggedIn(), configuration.PerformReset)

	users.POST("/reset/key", configuration.EnsureNotLoggedIn(), configuration.ResetWithKey)

	users.GET("/login", configuration.EnsureNotLoggedIn(), configuration.ShowLoginPage)

	users.GET("/reset", configuration.EnsureNotLoggedIn(), configuration.ShowResetPage)

	users.GET("/logout", configuration.EnsureLoggedIn(), configuration.Logout)

	/********************************** GET OPERATIONS ****************************************/

	/************** ALL ITEMS *****************/

	// Gets all items
	router.GET("/all", configuration.EnsureLoggedIn(), func(c *gin.Context) {

		table := c.DefaultQuery("table", "")

		if table == "Users" {
			c.AbortWithStatus(http.StatusUnauthorized)
		}

		field := c.DefaultQuery("field", "")
		item := c.DefaultQuery("item", "")
		obj := m[table]
		limit2 := c.DefaultQuery("limit", "")
		limit, err := strconv.Atoi(limit2)
		page2 := c.DefaultQuery("page", "1")
		page, err := strconv.Atoi(page2)
		if err != nil {
			fmt.Println(err.Error())
		}
		if page > 0 {
			page--
		} else if page < 0 {
			page = 0
		}
		offset2 := limit * page
		offset := strconv.Itoa(offset2)
		vars.AllItems(offset, limit2, field, item, table, c, obj)

		vars.ComputerArr, vars.FurnitureArr, vars.PrintersArr, vars.SuppliesArr, vars.WarehouseArr = nil, nil, nil, nil, nil
		vars.Result = nil
		vars.Thingslist = nil
		table, field, item, limit2, offset = "", "", "", "", ""

	})

	/********************************* POST OPERATIONS *****************************************/

	/************** POST TO SPECIFIC TABLE *****************/

	// Create new Item
	router.POST("/all", configuration.EnsureLoggedIn(), func(c *gin.Context) {

		table := c.PostForm("table")
		vars.NewItem(table, c)

		// c.JSON(http.StatusOK, gin.H{
		// 	"message": fmt.Sprintf(" %s successfully created", vars.NewItem(table, c)),
		// })

		vars.ComputerArr, vars.FurnitureArr, vars.PrintersArr, vars.SuppliesArr, vars.WarehouseArr = nil, nil, nil, nil, nil
		vars.Result = nil
		table = ""

	})

	// /********************************* UPDATE OPERATIONS *****************************************/

	// /************** GLOBAL UPDATE BASED ON FIELD *****************/

	router.PUT("/all", configuration.EnsureLoggedIn(), func(c *gin.Context) {

		table := c.DefaultQuery("table", "")
		field := c.DefaultQuery("field", "")
		item := c.DefaultQuery("item", "")

		c.JSON(http.StatusOK, gin.H{
			"message": fmt.Sprintf("Successfully updated all items with "+field+" %s", vars.UpdateItemsByField(table, field, item, tables, c)),
		})

		vars.ComputerArr, vars.FurnitureArr, vars.PrintersArr, vars.SuppliesArr, vars.WarehouseArr = nil, nil, nil, nil, nil
		table, field, item = "", "", ""

	})

	/********************************* DELETE OPERATIONS *****************************************/

	/************** DELETE A SPECIFIC ITEM *****************/

	// Delete By Name
	router.DELETE("/all", configuration.EnsureLoggedIn(), func(c *gin.Context) {

		table := c.DefaultQuery("table", "")
		field := c.DefaultQuery("field", "")
		item := c.DefaultQuery("item", "")

		c.JSON(http.StatusOK, gin.H{
			"message": fmt.Sprintf("Successfully deleted items with Name: %s", vars.DeleteItemsByField(table, field, item, tables, c)),
		})

		vars.ComputerArr, vars.FurnitureArr, vars.PrintersArr, vars.SuppliesArr, vars.WarehouseArr = nil, nil, nil, nil, nil
		table, field, item = "", "", ""

	})

	router.Run(":3000")
}
