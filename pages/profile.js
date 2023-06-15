import React, { useState, useEffect, useCallback } from 'react';
import { Auth, Typography, Button } from "@supabase/ui";
import { Form, Input, Select } from "antd";
const { Text } = Typography;
const { Option } = Select;
import { supabase } from '../api';

function Profile(props) {
    const { user } = Auth.useUser();
    const [age, setAge] = useState("");
    const [sex, setSex] = useState("");
    const [ethnicity, setEthnicity] = useState("");
    const [location, setLocation] = useState("");
    const [editing, setEditing] = useState(false);

    const fetchProfile = useCallback(async () => {
        if (user && user.id) {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select("*")
                    .eq('user_id', user.id)
                    .single();

                if (error) throw error;

                if (data) {
                    setAge(data.age);
                    setSex(data.sex);
                    setEthnicity(data.ethnicity);
                    setLocation(data.location);
                }
            } catch (error) {
                console.error('Fetch error:', error);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async () => fetchProfile()
        );

        return () => {
            authListener.unsubscribe();
        };
    }, [fetchProfile]);

    const handleSubmit = async () => {
        try {
            // Validate form data before submitting
            if (!age || !sex || !ethnicity || !location) {
                throw new Error('Please fill out all fields');
            }

            const { data, error } = await supabase
                .from('profiles')
                .upsert([
                  { user_id: user.id, age: age, sex: sex, ethnicity: ethnicity, location: location },
                ]);

            if (error) throw error;

            console.log('Profile saved successfully!');
            setEditing(false); // switch back to view mode after successful submit
        } catch (error) {
            console.error('Error inserting/updating profile: ', error);
        }
    }
    

    if (user)
      return (
        <div className="profile-container">
          <Text>Signed in: {user.email}</Text>
          {editing ? (
            <Form onFinish={handleSubmit} className="profile-form">
              <Form.Item label="Age" name="age">
                <Input value={age} onChange={(e) => setAge(e.target.value)} />
              </Form.Item>
              <Form.Item label="Sex" name="sex">
                <Select value={sex} onChange={(value) => setSex(value)}>
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                </Select>
              </Form.Item>
              <Form.Item label="Ethnicity" name="ethnicity">
                <Select value={ethnicity} onChange={(value) => setEthnicity(value)}>
                  <Option value="white">White</Option>
                  <Option value="asian">Asian</Option>
                  <Option value="black">Black</Option>
                  <Option value="hispanic">Hispanic</Option>
                  <Option value="native_american">Native American</Option>
                  <Option value="middle_eastern">Middle Eastern</Option>
                  <Option value="pacific_islander">Pacific Islander</Option>
                  <Option value="mixed">Mixed</Option>
                  <Option value="other">Other</Option>
                  // Add more options as needed
                </Select>
              </Form.Item>
              <Form.Item label="Location" name="location">
                <Select value={location} onChange={(value) => setLocation(value)}>
                  <Option value="us">US</Option>
                  <Option value="uk">UK</Option>
                  <Option value="canada">Canada</Option>
                  <Option value="mexico">Mexico</Option>
                  <Option value="australia">Australia</Option>
                  <Option value="india">India</Option>
                  <Option value="china">China</Option>
                  <Option value="brazil">Brazil</Option>
                  <Option value="south_africa">South Africa</Option>
                  <Option value="germany">Germany</Option>
                  <Option value="france">France</Option>
                  <Option value="italy">Italy</Option>
                  <Option value="spain">Spain</Option>
                  <Option value="japan">Japan</Option>
                  <Option value="russia">Russia</Option>
                  <Option value="other">Other</Option>
                  // Add more options as needed
                </Select>
              </Form.Item>
              <Form.Item className="button-container">
                <Button className="button-margin" Button type="primary" htmlType="submit" block>Submit</Button>
                <Button block onClick={() => props.supabaseClient.auth.signOut()}>Sign out</Button>
                </Form.Item>
              </Form>
            ) : (
              <>
                <Text>Age: {age}</Text>
                <Text>Sex: {sex}</Text>
                <Text>Ethnicity: {ethnicity}</Text>
                <Text>Location: {location}</Text>
                <Button onClick={() => setEditing(true)}>Edit Profile</Button>
              </>
            )}
          </div>
        );
      return props.children;
  }

export default function AuthProfile() {
    return (
        <Auth.UserContextProvider supabaseClient={supabase}>
          <Profile supabaseClient={supabase}>
            <Auth supabaseClient={supabase} />
          </Profile>
        </Auth.UserContextProvider>
    )
}
