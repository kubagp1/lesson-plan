import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import React from "react";
import ReactDom from "react-dom";

import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import NativeSelect from "@mui/material/NativeSelect"

const whiteNativeSelect = {
    color: "white",
    "& .MuiNativeSelect-icon": {
        color: "white"
    },
    "&::before": {
        borderBottomColor: "white"
    }
}

const App = () => {
    const [selectedTab, setSelectedTab] = React.useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    return (
        <div>
            <AppBar position="static">
                <Toolbar sx={{ display: "flex", gap: "16px" }}>
                    <NativeSelect sx={whiteNativeSelect}>
                        <option value="students">Uczniowie</option>
                        <option value="teachers">Nauczyciele</option>
                    </NativeSelect>
                    <NativeSelect sx={whiteNativeSelect}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="other">Inne</option>
                    </NativeSelect>
                    <NativeSelect sx={whiteNativeSelect}>
                        <option value="a">a</option>
                        <option value="b">b</option>
                        <option value="c">c</option>
                        <option value="d">d</option>
                    </NativeSelect>
                </Toolbar>
            </AppBar>

            <Tabs variant="fullWidth" value={selectedTab} onChange={handleTabChange}>
                <Tab sx={{ minWidth: 0 }} label="Pon." ></Tab>
                <Tab sx={{ minWidth: 0 }} label="Wt."></Tab>
                <Tab sx={{ minWidth: 0 }} label="Śr."></Tab>
                <Tab sx={{ minWidth: 0 }} label="Czw."></Tab>
                <Tab sx={{ minWidth: 0 }} label="Pt."></Tab>
            </Tabs>
        </div >

    )

};

ReactDom.render(<App />, document.getElementById("app"));