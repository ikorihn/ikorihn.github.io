package main

import "fmt"

type President struct {
	FirstName string
	LastName  string
	Age       int
}

func (p President) FullName() {
	fmt.Printf("%s %s\n", p.FirstName, p.LastName)
}

func main() {

	ronaldRaegan := President{
		FirstName: "Ronald",
		LastName:  "Reagan",
	}

	ronaldRaegan.FullName()
}
