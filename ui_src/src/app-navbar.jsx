import React from 'react';
import {
    Navbar,
    NavbarBrand
} from 'reactstrap';

class AppNavbar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Navbar color="dark" dark>
                    <NavbarBrand href="/">blockdiag Live Preview</NavbarBrand>
                </Navbar>
            </div>
        )
    }
}

export default AppNavbar;